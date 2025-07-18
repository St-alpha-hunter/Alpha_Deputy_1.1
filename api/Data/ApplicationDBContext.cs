using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using api.Models; 
namespace api.Data
{
     public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {
        }

        public DbSet<Comment> Comment { get; set; }
        public DbSet<Stock> Stock { get; set; }

        // 你可以继续添加 DbSet<T> 属性来注册更多的模型类
    }
}

//页面负责网关，和上下文对象