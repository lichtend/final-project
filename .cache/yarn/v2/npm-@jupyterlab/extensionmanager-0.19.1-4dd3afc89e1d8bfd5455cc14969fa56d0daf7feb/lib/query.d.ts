import { IJupyterLabPackageData } from './companions';
/**
 * Information about a person in search results.
 */
export interface IPerson {
    /**
     * The username of the person.
     */
    username: string;
    /**
     * The email of the person.
     */
    email: string;
}
/**
 * NPM registry search result structure (subset).
 *
 * See https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
 * for full specification.
 */
export interface ISearchResult {
    /**
     * A collection of search results.
     */
    objects: {
        /**
         * Metadata about the found package.
         */
        package: {
            /**
             * The package name.
             */
            name: string;
            /**
             * The scope of the package (e.g. jupyterlab for @jupyterlab/services).
             */
            scope: string;
            /**
             * Version number.
             */
            version: string;
            /**
             * Description as listed in package.json.
             */
            description: string;
            /**
             * Package keywords.
             */
            keywords: string[];
            /**
             * Timestamp of release(?).
             */
            date: string;
            /**
             * Various metadata links for the package.
             */
            links: {
                [key: string]: string;
            };
            /**
             * Metadata about user who published the release.
             */
            publisher: IPerson;
            /**
             * Maintainer list per package.json.
             */
            maintainers: IPerson[];
        };
        /**
         * Flags about the package.
         */
        flags: {
            /**
             * Package is insecure or have vulnerable dependencies (based on the nsp registry).
             */
            insecure: number;
            /**
             * Package has a version < 1.0.0.
             */
            unstable: boolean;
        };
        /**
         * Object detailing the normalized search score.
         */
        score: {
            /**
             * The final normalized search score.
             */
            final: number;
            /**
             * Break down of the search score.
             */
            detail: {
                /**
                 * The normalized quality score.
                 */
                quality: number;
                /**
                 * The normalized popularity score.
                 */
                popularity: number;
                /**
                 * The normalized maintenance score.
                 */
                maintenance: number;
            };
        };
        /**
         * The search score.
         */
        searchScore: number;
    }[];
    /**
     * The total number of objects found by the search.
     *
     * This can be greater than the number of objects due
     * to pagination of the search results.
     */
    total: number;
    /**
     * Timestamp of the search result creation.
     */
    time: string;
}
/**
 * An interface for a subset of the keys known to be included for package metadata.
 *
 * See https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
 * for full specification.
 */
export interface IPackageMetadata {
    /**
     * The package name.
     */
    name: string;
    /**
     * ISO string of the last time this package was modified.
     */
    modified: string;
    /**
     * A mapping of dist tags to the versions they point to.
     */
    'dist-tags': {
        /**
         * The version tagged as 'latest'.
         */
        latest: string;
        [key: string]: string;
    };
    /**
     * A short description of the package.
     */
    description: string;
    /**
     * A mapping of semver-compliant version numbers to version data.
     */
    versions: {
        [key: string]: {
            /**
             * The package name.
             */
            name: string;
            /**
             * The version string for this version.
             */
            version: string;
            /**
             * The deprecation warnings message of this version.
             */
            deprecated?: string;
            /**
             * A short description of the package.
             */
            description: string;
        };
    };
}
/**
 * An object for searching an NPM registry.
 *
 * Searches the NPM registry via web API:
 * https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
 */
export declare class Searcher {
    /**
     * Create a Searcher object.
     *
     * @param repoUri The URI of the NPM registry to use.
     * @param cdnUri The URI of the CDN to use for fetching full package data.
     */
    constructor(repoUri?: string, cdnUri?: string);
    /**
     * Search for a jupyterlab extension.
     *
     * @param query The query to send. `keywords:"jupyterlab-extension"` will be appended to the query.
     * @param page The page of results to fetch.
     * @param pageination The pagination size to use. See registry API documentation for acceptable values.
     */
    searchExtensions(query: string, page?: number, pageination?: number): Promise<ISearchResult>;
    /**
     * Fetch package.json of a package
     *
     * @param name The package name.
     * @param version The version of the package to fetch.
     */
    fetchPackageData(name: string, version: string): Promise<IJupyterLabPackageData | null>;
    /**
     * The URI of the NPM registry to use.
     */
    repoUri: string;
    /**
     * The URI of the CDN to use for fetching full package data.
     */
    cdnUri: string;
}
/**
 * Check whether the NPM org is a Jupyter one.
 */
export declare function isJupyterOrg(name: string): boolean;
