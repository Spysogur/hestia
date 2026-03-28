using Npgsql;

namespace Hestia.Infrastructure.Persistence;

/// <summary>
/// Translates PascalCase C# enum names to UPPER_SNAKE_CASE Postgres enum labels.
/// E.g. InProgress → IN_PROGRESS, Active → ACTIVE, MedicalCondition → MEDICAL_CONDITION
/// </summary>
public sealed class UpperSnakeCaseTranslator : INpgsqlNameTranslator
{
    public string TranslateTypeName(string clrName) => ToUpperSnakeCase(clrName);
    public string TranslateMemberName(string clrName) => ToUpperSnakeCase(clrName);

    private static string ToUpperSnakeCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;

        var sb = new System.Text.StringBuilder(name.Length + 4);
        for (int i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (i > 0 && char.IsUpper(c) && !char.IsUpper(name[i - 1]))
                sb.Append('_');
            else if (i > 0 && char.IsUpper(c) && char.IsUpper(name[i - 1]) && i + 1 < name.Length && char.IsLower(name[i + 1]))
                sb.Append('_');
            sb.Append(char.ToUpperInvariant(c));
        }
        return sb.ToString();
    }
}
