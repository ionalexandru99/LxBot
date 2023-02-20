using FluentValidation;
using GameAnnouncer.Core.Abstractions.Configurations;
using GameAnnouncer.Core.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GameAnnouncer.Core;

public static class DependencyInjection
{
    public static IServiceCollection AddCore(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatorsFromAssemblyContaining<ICoreApplicationInterface>(ServiceLifetime.Singleton);

        services.AddConfiguration<DiscordConfiguration>(configuration);

        return services;
    }
}