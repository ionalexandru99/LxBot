using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using FluentValidation;
using Microsoft.Extensions.Options;

namespace GameAnnouncer.Core.Validations;

public class FluentValidationOptions<TOptions>
        : IValidateOptions<TOptions> where TOptions : class
    {
        private readonly IValidator<TOptions> _validator;

        public FluentValidationOptions(string? name, IValidator<TOptions> validator)
        {
            _validator = validator;
            Name = name;
        }

        public string? Name { get; }
        
        public ValidateOptionsResult Validate(string? name, TOptions options)
        {
            if (Name != null && Name != name)
            {
                return ValidateOptionsResult.Skip;
            }

            ArgumentNullException.ThrowIfNull(options);

            var validationResults = _validator.Validate(options);

            if (validationResults.IsValid)
            {
                return ValidateOptionsResult.Success;
            }

            var errors = validationResults.Errors.Select(x =>
                $"Options validation failed for property {x.PropertyName} with error: {x.ErrorMessage}");
            
            return ValidateOptionsResult.Fail(errors);
        }
    }