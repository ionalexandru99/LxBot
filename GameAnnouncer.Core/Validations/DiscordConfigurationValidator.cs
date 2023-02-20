using FluentValidation;
using GameAnnouncer.Core.Abstractions.Configurations;

namespace GameAnnouncer.Core.Validations;

public class DiscordConfigurationValidator : AbstractValidator<DiscordConfiguration>
{
    public DiscordConfigurationValidator()
    {
        RuleFor(x => x.Token)
            .NotNull()
            .NotEmpty();
    }
}