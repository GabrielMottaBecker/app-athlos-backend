import { type Type } from "@nestjs/common";
type BootstrapHttpAppOptions = {
    title: string;
    description: string;
    version?: string;
    globalPrefix?: string;
    port?: number | string;
};
export declare function bootstrapHttpApp(rootModule: Type<unknown>, options: BootstrapHttpAppOptions): Promise<void>;
export {};
