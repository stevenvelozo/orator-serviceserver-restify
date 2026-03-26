export = OratorServiceServerRestify;
/**
 * @extends {libOratorServiceServerBase<import('restify').Request, import('restify').Response, import('restify').Server>}
 */
declare class OratorServiceServerRestify extends libOratorServiceServerBase<libRestify.Request, libRestify.Response, libRestify.Server> {
    /**
     * @param {import('fable')|Record<string, any>} [pFable] - (optional) The fable instance, or the options object if there is no fable
     * @param {Record<string, any>|string} [pOptions] - (optional) The options object, or the service hash if there is no fable
     * @param {string} [pServiceHash] - (optional) The service hash to identify this service instance
     */
    constructor(pFable?: any | Record<string, any>, pOptions?: Record<string, any> | string, pServiceHash?: string);
    /** @type {import('restify').Server} */
    server: import("restify").Server;
    /**
     * Middleware function for parsing the request body.
     *
     * @param {Record<string, any>} [pOptions] - The options for the body parser.
     * @return {import('restify').RequestHandler[]} - The middleware function.
     */
    bodyParser(pOptions?: Record<string, any>): import("restify").RequestHandler[];
    /**
     * Handles HTTP GET requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route of the request.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions for the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doGet(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles HTTP PUT requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route to handle.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doPut(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles the HTTP POST request for a specific route.
     *
     * @param {string} pRoute - The route to handle the POST request for.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doPost(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles HTTP DELETE requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route of the resource to delete.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to be executed to delete the resource.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doDel(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles HTTP PATCH requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route to send the PATCH request to.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to apply to the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doPatch(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles HTTP OPT requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to apply to the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doOpts(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
    /**
     * Handles HTTP HEAD requests -- this is a base function that does nothing; override by the serviceserver is expected.
     *
     * @param {string} pRoute - The route to handle the HEAD request for.
     * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
     * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
     */
    doHead(pRoute: string, ...fRouteProcessingFunctions: import("restify").RequestHandlerType[]): any;
}
import libRestify = require("restify");
import libOratorServiceServerBase = require("orator-serviceserver-base");
//# sourceMappingURL=Orator-ServiceServer-Restify.d.ts.map