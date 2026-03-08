using System.Reflection;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Contracts;

public sealed class EnumMemberJsonConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
        => typeToConvert.IsEnum;

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(EnumMemberJsonConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter)Activator.CreateInstance(converterType)!;
    }

    private sealed class EnumMemberJsonConverter<TEnum> : JsonConverter<TEnum> where TEnum : struct, Enum
    {
        private readonly Dictionary<string, TEnum> _fromString;
        private readonly Dictionary<TEnum, string> _toString;

        public EnumMemberJsonConverter()
        {
            _fromString = new(StringComparer.OrdinalIgnoreCase);
            _toString = new();

            foreach (var field in typeof(TEnum).GetFields(BindingFlags.Public | BindingFlags.Static))
            {
                var enumValue = (TEnum)field.GetValue(null)!;

                var enumMember = field.GetCustomAttribute<EnumMemberAttribute>();
                var text = enumMember?.Value ?? field.Name;

                _fromString[text] = enumValue;
                _toString[enumValue] = text;
            }
        }

        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.String)
                throw new JsonException($"Expected string for enum {typeof(TEnum).Name}.");

            var s = reader.GetString();
            if (s is null || !_fromString.TryGetValue(s, out var value))
                throw new JsonException($"Unknown value '{s}' for enum {typeof(TEnum).Name}.");

            return value;
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
        {
            if (_toString.TryGetValue(value, out var s))
                writer.WriteStringValue(s);
            else
                writer.WriteStringValue(value.ToString());
        }
    }
}