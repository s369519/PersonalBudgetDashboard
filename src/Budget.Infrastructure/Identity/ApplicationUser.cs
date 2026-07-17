using Microsoft.AspNetCore.Identity;

namespace Budget.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}