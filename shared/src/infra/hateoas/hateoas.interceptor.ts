import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, type Observable } from "rxjs";
import {
  HATEOAS_ITEM_KEY,
  HATEOAS_LIST_KEY,
  type HateoasItemOptions,
  type HateoasListOptions,
} from "./hateoas.decorators";
import type { PaginatedResult } from "./hateoas.types";

@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const itemOptions = this.reflector.get<HateoasItemOptions<unknown>>(
      HATEOAS_ITEM_KEY,
      context.getHandler(),
    );

    const listOptions = this.reflector.get<HateoasListOptions<unknown>>(
      HATEOAS_LIST_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        if (itemOptions && data) {
          return {
            ...data,
            _links: itemOptions.itemLinks(data),
          };
        }

        if (listOptions && data) {
          const paginated = data as PaginatedResult<Record<string, unknown>>;

          return {
            ...paginated,
            data: paginated.data.map((item) => ({
              ...item,
              _links: listOptions.itemLinks(item),
            })),
            _links: {
              self: {
                href: `${listOptions.basePath}?_page=${paginated.page}&_size=${paginated.limit}`,
                method: "GET",
              },
            },
          };
        }

        return data;
      }),
    );
  }
}