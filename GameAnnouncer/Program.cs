using GameAnnouncer;
using GameAnnouncer.Core;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        var configuration = context.Configuration;
        services.AddCore(configuration);
        
        services.AddHostedService<Worker>();
    })
    .Build();

host.Run();