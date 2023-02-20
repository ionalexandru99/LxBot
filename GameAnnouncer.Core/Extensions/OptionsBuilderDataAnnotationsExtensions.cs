using FluentValidation;
using GameAnnouncer.Core.Validations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace GameAnnouncer.Core.Extensions;

public static class OptionsBuilderDataAnnotationsExtensions
{
    public static OptionsBuilder<TOptions> ValidateUsingFluentValidation<TOptions>(this OptionsBuilder<TOptions> optionsBuilder) 
        where TOptions : class
    {
        optionsBuilder.Services.AddSingleton<IValidateOptions<TOptions>>(
            serviceProvider => new FluentValidationOptions<TOptions>(optionsBuilder.Name, serviceProvider.GetRequiredService<IValidator<TOptions>>()));
        return optionsBuilder;
    }
}