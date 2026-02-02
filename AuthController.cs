using global::UniProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace UniProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // =======================
        // Donor Registration
        // =======================
        [HttpPost("register/donor")]
        public async Task<IActionResult> RegisterDonor([FromBody] DonorRegistrationDto registrationDto)
        {
            try
            {
                var existingDonor = await _context.Donors
                    .FirstOrDefaultAsync(d =>
                        d.UniversityId == registrationDto.UniversityId ||
                        d.Email == registrationDto.Email);

                if (existingDonor != null)
                    return BadRequest(new { message = "Donor already registered with this University ID or Email" });

                var donor = new Donor
                {
                    Name = registrationDto.Name,
                    UniversityId = registrationDto.UniversityId,
                    BloodGroup = registrationDto.BloodGroup,
                    PhoneNumber = registrationDto.PhoneNumber,
                    Email = registrationDto.Email,
                    LastDonationDate = registrationDto.LastDonationDate,
                    IsAvailable = true,

                    // 🔐 Password Hash
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password)
                };

                await _context.Donors.AddAsync(donor);
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(donor.Id.ToString(), "Donor", donor.UniversityId);

                return Ok(new
                {
                    message = "Donor registered successfully",
                    donorId = donor.Id,
                    token,
                    donor = new
                    {
                        donor.Name,
                        donor.UniversityId,
                        donor.BloodGroup,
                        donor.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
        }

        // =======================
        // Donor Login
        // =======================
        [HttpPost("login/donor")]
        public async Task<IActionResult> LoginDonor([FromBody] DonorLoginDto loginDto)
        {
            var donor = await _context.Donors
                .FirstOrDefaultAsync(d => d.UniversityId == loginDto.UniversityId);

            if (donor == null)
                return Unauthorized(new { message = "Donor not found" });

            // 🔐 Password Verify
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, donor.PasswordHash))
                return Unauthorized(new { message = "Invalid password" });

            var token = GenerateJwtToken(donor.Id.ToString(), "Donor", donor.UniversityId);

            return Ok(new
            {
                message = "Login successful",
                token,
                donor = new
                {
                    donor.Id,
                    donor.Name,
                    donor.UniversityId,
                    donor.BloodGroup,
                    donor.Email,
                    donor.IsAvailable
                }
            });
        }

        // =======================
        // Admin Login
        // =======================
        [HttpPost("login/admin")]
        public async Task<IActionResult> LoginAdmin([FromBody] AdminLoginDto loginDto)
        {
            var adminUsername = _configuration["AdminCredentials:Username"];
            var adminPassword = _configuration["AdminCredentials:Password"];

            if (loginDto.Username == adminUsername && loginDto.Password == adminPassword)
            {
                var token = GenerateJwtToken("1", "Admin", "admin");
                return Ok(new { message = "Admin login successful", token, role = "Admin" });
            }

            return Unauthorized(new { message = "Invalid admin credentials" });
        }

        private string GenerateJwtToken(string userId, string role, string uniqueName)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.Name, uniqueName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // =======================
        // Verify Token
        // =======================
        [Authorize]
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return Ok(new
            {
                message = "Token is valid",
                userId,
                role,
                username,
                isValid = true
            });
        }
    }

    // =======================
    // DTOs
    // =======================
    public class DonorRegistrationDto
    {
        public string Name { get; set; }
        public string UniversityId { get; set; }
        public string BloodGroup { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime LastDonationDate { get; set; }

        // 🔐 Added
        public string Password { get; set; }
    }

    public class DonorLoginDto
    {
        public string UniversityId { get; set; }

        // 🔐 Added
        public string Password { get; set; }
    }

    public class AdminLoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
