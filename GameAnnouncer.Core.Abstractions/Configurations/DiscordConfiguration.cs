using GameAnnouncer.Core.Abstractions.Attributes;

namespace GameAnnouncer.Core.Abstractions.Configurations;

[ConfigurationSection("DiscordConfiguration")]
public class DiscordConfiguration : IReadConfiguration
{
    public required string Token { get; set; }
    public required  string Name { get; set; }
}