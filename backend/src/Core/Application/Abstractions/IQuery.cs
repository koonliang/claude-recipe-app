using BuildingBlocks.Common;
using MediatR;

namespace Core.Application.Abstractions;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}