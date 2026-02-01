namespace UniProject.Dtos
{
    public class DonorLoginModel
    {
        public string UniversityId { get; set; }
        public string Password { get; set; } // In a real app, we should hash passwords. For simplicity, we are using plain text in this example.
    }

    public class AdminLoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // Models/NotificationLog.cs
    public class NotificationLog
    {
        public int Id { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Email, SMS
        public string Subject { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Sent, Failed
        public DateTime SentAt { get; set; } = DateTime.Now;
        public string? ErrorMessage { get; set; }
    }

    // Models/NotificationPreferences.cs
    public class NotificationPreferences
    {
        public int Id { get; set; }
        public int DonorId { get; set; }
        public bool ReceiveEmail { get; set; } = true;
        public bool ReceiveSms { get; set; } = true;
        public bool EmergencyAlerts { get; set; } = true;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public object Donor { get; internal set; }
    }
}
namespace UniProject.Dtos
{
    // Donor DTOs
    public class DonorRegistrationDto
    {
        public string Name { get; set; } = string.Empty;
        public string UniversityId { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime LastDonationDate { get; set; }
    }

    public class DonorLoginDto
    {
        public string UniversityId { get; set; } = string.Empty;
    }

    public class UpdateDonorDto
    {
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public bool? IsAvailable { get; set; }
        public DateTime? LastDonationDate { get; set; }
    }

    // Emergency DTOs
    public class CreateEmergencyDto
    {
        public string BloodGroup { get; set; } = string.Empty;
        public int UnitsRequired { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class EmergencyResponseDto
    {
        public bool IsAvailable { get; set; }
    }

    // Admin DTOs
    public class AdminLoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // Notification DTOs
    public class UpdatePreferencesDto
    {
        public bool ReceiveEmail { get; set; }
        public bool ReceiveSms { get; set; }
        public bool EmergencyAlerts { get; set; }
    }

    public class CustomNotificationDto
    {
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? BloodGroupFilter { get; set; }
    }

    public class TestNotificationDto
    {
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    // Response DTOs
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}