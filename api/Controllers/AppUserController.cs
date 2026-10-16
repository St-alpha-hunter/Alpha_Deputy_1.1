using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Account;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


namespace api.Controllers
{
    [Route("api/account")]
    [ApiController]
    // [默认需要登录 2026-10-16] Program.cs 里设了“默认所有接口都要登录”，登录/注册必须对未登录用户开放，
    // 否则谁都登录不了。整个 Controller 只有这两个接口，所以直接标在类上
    [AllowAnonymous]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<AppUser> _signinManager;
        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, SignInManager<AppUser> signinManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signinManager = signinManager;
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto LoginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == LoginDto.Username);

            if (user == null) return Unauthorized("Invalid Username");
            var result = await _signinManager.CheckPasswordSignInAsync(user, LoginDto.Password, false);

            if (!result.Succeeded) return Unauthorized("Username password not found");
            return Ok(
                new NewUserDto
                {
                    UserName = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user)
                }
            );
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var appUser = new AppUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.EmailAddress
                };

                var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);

                if (createdUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(appUser, "User");
                    if (roleResult.Succeeded)
                    {
                        return Ok(
                            new NewUserDto
                            {
                                UserName = appUser.UserName,
                                Email = appUser.Email,
                                Token = _tokenService.CreateToken(appUser)
                            }
                        );
                    }
                    else
                    {
                        return StatusCode(500, new
                        {
                            message = "Register failed. Username may already exist.",
                            errors = roleResult.Errors
                        });
                    }
                }
                else
                {
                    return StatusCode(500, new
                    {
                        message = "Register failed. Password format may be incorrect or username may already exist.",
                        errors = createdUser.Errors
                    });
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }


    }
}