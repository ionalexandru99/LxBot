using System.Diagnostics.CodeAnalysis;

namespace GameAnnouncer.Core.Abstractions.Attributes;

public class ConfigurationSectionAttribute : Attribute
{
    public string Section { get; }

    public ConfigurationSectionAttribute(string sectionName)
    {
        Section = sectionName;
    }
}