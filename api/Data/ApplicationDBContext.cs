using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using api.Models;
using api.Migrations;
using Microsoft.AspNetCore.Identity;
namespace api.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {
        }

        public required DbSet<Comment> Comment { get; set; }
        public required DbSet<Stock> Stock { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole
                {
                    Id = "1a111111-1111-1111-1111-111111111111",
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole
                {
                    Id = "2b222222-2222-2222-2222-222222222222",
                    Name = "User",
                    NormalizedName = "USER"
                }
            };
            builder.Entity<IdentityRole>().HasData(roles);
        }
        // 你可以继续添加 DbSet<T> 属性来注册更多的模型类
    }
}

//页面负责网关，和上下文对象