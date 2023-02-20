using GameAnnouncer.Core.Abstractions.Attributes;
using GameAnnouncer.Core.Abstractions.Configurations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GameAnnouncer.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConfiguration<TConfigurationClass>(this IServiceCollection services, IConfiguration configuration)
        where TConfigurationClass : IReadConfiguration
    {
        var attribute = Attribute.GetCustomAttribute(typeof(TConfigurationClass), typeof(ConfigurationSectionAttribute)) 
            as ConfigurationSectionAttribute;
        
        ArgumentNullException.ThrowIfNull(attribute);

        services.AddOptions<DiscordConfiguration>()
            .Bind(configuration.GetSection(attribute.Section))
            .ValidateUsingFluentValidation()
            .ValidateOnStart();

        return services;
    }
}