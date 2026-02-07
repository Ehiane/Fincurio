namespace Fincurio.Core.Models.DTOs.Merchant;

public class MerchantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class MerchantListResponseDto
{
    public List<MerchantDto> Merchants { get; set; } = new();
}

public class CreateMerchantDto
{
    public string Name { get; set; } = string.Empty;
}
