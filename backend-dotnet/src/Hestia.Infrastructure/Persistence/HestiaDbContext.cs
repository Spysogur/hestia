using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence;

public class HestiaDbContext : DbContext
{
    public HestiaDbContext(DbContextOptions<HestiaDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Community> Communities => Set<Community>();
    public DbSet<Emergency> Emergencies => Set<Emergency>();
    public DbSet<HelpRequest> HelpRequests => Set<HelpRequest>();
    public DbSet<HelpOffer> HelpOffers => Set<HelpOffer>();
    public DbSet<MapPin> MapPins => Set<MapPin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("uuid-ossp");
        modelBuilder.HasPostgresExtension("postgis");

        // ── User ──────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(u => u.FullName).HasColumnName("full_name").HasMaxLength(255).IsRequired();
            e.Property(u => u.Phone).HasColumnName("phone").HasMaxLength(50).IsRequired();
            e.Property(u => u.Role).HasColumnName("role")
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .HasDefaultValue(UserRole.Member);
            e.Property(u => u.Skills).HasColumnName("skills")
                .HasColumnType("text[]")
                .HasDefaultValueSql("'{}'");
            e.Property(u => u.Vulnerabilities).HasColumnName("vulnerabilities")
                .HasColumnType("text[]")
                .HasConversion(
                    v => v.Select(x => x.ToString()).ToArray(),
                    v => v.Select(Enum.Parse<VulnerabilityType>).ToList())
                .HasDefaultValueSql("'{}'");
            e.Property(u => u.Resources).HasColumnName("resources")
                .HasColumnType("text[]")
                .HasDefaultValueSql("'{}'");
            e.Property(u => u.Latitude).HasColumnName("latitude");
            e.Property(u => u.Longitude).HasColumnName("longitude");
            e.Property(u => u.CommunityId).HasColumnName("community_id");
            e.Property(u => u.IsVerified).HasColumnName("is_verified").HasDefaultValue(false);
            e.Property(u => u.CreatedAt).HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at")
                .HasDefaultValueSql("NOW()");
        });

        // ── Community ─────────────────────────────────────────
        modelBuilder.Entity<Community>(e =>
        {
            e.ToTable("communities");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");
            e.Property(c => c.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            e.HasIndex(c => c.Name).IsUnique();
            e.Property(c => c.Description).HasColumnName("description").IsRequired();
            e.Property(c => c.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(c => c.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(c => c.RadiusKm).HasColumnName("radius_km").HasColumnType("numeric(10,2)").IsRequired();
            e.Property(c => c.Country).HasColumnName("country").HasMaxLength(100).IsRequired();
            e.Property(c => c.Region).HasColumnName("region").HasMaxLength(100).IsRequired();
            e.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(c => c.MemberCount).HasColumnName("member_count").HasDefaultValue(0);
            e.Property(c => c.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.Ignore(c => c.Emergencies);
        });

        // ── Emergency ─────────────────────────────────────────
        modelBuilder.Entity<Emergency>(e =>
        {
            e.ToTable("emergencies");
            e.HasKey(em => em.Id);
            e.Property(em => em.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
            e.Property(em => em.CommunityId).HasColumnName("community_id").IsRequired();
            e.Property(em => em.Type).HasColumnName("type")
                .HasConversion<string>().HasColumnType("varchar(20)").IsRequired();
            e.Property(em => em.Severity).HasColumnName("severity")
                .HasConversion<string>().HasColumnType("varchar(20)").IsRequired();
            e.Property(em => em.Status).HasColumnName("status")
                .HasConversion<string>().HasColumnType("varchar(20)")
                .HasDefaultValue(EmergencyStatus.Active);
            e.Property(em => em.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
            e.Property(em => em.Description).HasColumnName("description").IsRequired();
            e.Property(em => em.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(em => em.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(em => em.RadiusKm).HasColumnName("radius_km").HasColumnType("numeric(10,2)").IsRequired();
            e.Property(em => em.ActivatedBy).HasColumnName("activated_by").IsRequired();
            e.Property(em => em.ResolvedBy).HasColumnName("resolved_by");
            e.Property(em => em.ResolvedAt).HasColumnName("resolved_at");
            e.Property(em => em.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(em => em.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasOne(em => em.Community).WithMany().HasForeignKey(em => em.CommunityId).OnDelete(DeleteBehavior.Cascade);
            e.Ignore(em => em.HelpRequests);
            e.Ignore(em => em.HelpOffers);
        });

        // ── HelpRequest ───────────────────────────────────────
        modelBuilder.Entity<HelpRequest>(e =>
        {
            e.ToTable("help_requests");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
            e.Property(r => r.EmergencyId).HasColumnName("emergency_id").IsRequired();
            e.Property(r => r.RequesterId).HasColumnName("requester_id").IsRequired();
            e.Property(r => r.Type).HasColumnName("type")
                .HasConversion<string>().HasColumnType("varchar(20)").IsRequired();
            e.Property(r => r.Priority).HasColumnName("priority")
                .HasConversion<string>().HasColumnType("varchar(20)").IsRequired();
            e.Property(r => r.Status).HasColumnName("status")
                .HasConversion<string>().HasColumnType("varchar(20)")
                .HasDefaultValue(HelpRequestStatus.Open);
            e.Property(r => r.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
            e.Property(r => r.Description).HasColumnName("description").IsRequired();
            e.Property(r => r.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(r => r.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(r => r.NumberOfPeople).HasColumnName("number_of_people").IsRequired();
            e.Property(r => r.MatchedVolunteerId).HasColumnName("matched_volunteer_id");
            e.Property(r => r.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(r => r.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.Property(r => r.CompletedAt).HasColumnName("completed_at");
            e.HasOne(r => r.Emergency).WithMany().HasForeignKey(r => r.EmergencyId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── HelpOffer ─────────────────────────────────────────
        modelBuilder.Entity<HelpOffer>(e =>
        {
            e.ToTable("help_offers");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
            e.Property(o => o.EmergencyId).HasColumnName("emergency_id").IsRequired();
            e.Property(o => o.VolunteerId).HasColumnName("volunteer_id").IsRequired();
            e.Property(o => o.Type).HasColumnName("type")
                .HasConversion<string>().HasColumnType("varchar(20)").IsRequired();
            e.Property(o => o.Status).HasColumnName("status")
                .HasConversion<string>().HasColumnType("varchar(20)")
                .HasDefaultValue(HelpOfferStatus.Available);
            e.Property(o => o.Description).HasColumnName("description").IsRequired();
            e.Property(o => o.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(o => o.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(o => o.Capacity).HasColumnName("capacity").HasDefaultValue(1);
            e.Property(o => o.MatchedRequestId).HasColumnName("matched_request_id");
            e.Property(o => o.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(o => o.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasOne(o => o.Emergency).WithMany().HasForeignKey(o => o.EmergencyId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── MapPin ────────────────────────────────────────────
        modelBuilder.Entity<MapPin>(e =>
        {
            e.ToTable("map_pins");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");
            e.Property(p => p.EmergencyId).HasColumnName("emergency_id").IsRequired();
            e.Property(p => p.CreatedBy).HasColumnName("created_by").IsRequired();
            e.Property(p => p.Type).HasColumnName("type")
                .HasConversion<string>().HasColumnType("varchar(30)").IsRequired();
            e.Property(p => p.Label).HasColumnName("label").HasMaxLength(255).IsRequired();
            e.Property(p => p.Latitude).HasColumnName("latitude").IsRequired();
            e.Property(p => p.Longitude).HasColumnName("longitude").IsRequired();
            e.Property(p => p.Data).HasColumnName("data").HasColumnType("jsonb");
            e.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()");
            e.HasOne(p => p.Emergency).WithMany().HasForeignKey(p => p.EmergencyId).OnDelete(DeleteBehavior.Cascade);
            e.Ignore(p => p.Data); // handled separately if needed
        });
    }
}
