using Fincurio.Core.Exceptions;
using System.Net;
using System.Text.Json;

namespace Fincurio.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            NotFoundException notFoundEx => new
            {
                statusCode = (int)HttpStatusCode.NotFound,
                message = notFoundEx.Message
            },
            UnauthorizedException unauthorizedEx => new
            {
                statusCode = (int)HttpStatusCode.Unauthorized,
                message = unauthorizedEx.Message
            },
            ValidationException validationEx => new
            {
                statusCode = (int)HttpStatusCode.BadRequest,
                message = validationEx.Message
            },
            _ => new
            {
                statusCode = (int)HttpStatusCode.InternalServerError,
                message = "An internal server error occurred"
            }
        };

        context.Response.StatusCode = response.statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
