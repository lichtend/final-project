import { nbformat } from '@jupyterlab/coreutils';
/**
 * The mime type service of a code editor.
 */
export interface IEditorMimeTypeService {
    /**
     * Get a mime type for the given language info.
     *
     * @param info - The language information.
     *
     * @returns A valid mimetype.
     *
     * #### Notes
     * If a mime type cannot be found returns the defaul mime type `text/plain`, never `null`.
     */
    getMimeTypeByLanguage(info: nbformat.ILanguageInfoMetadata): string;
    /**
     * Get a mime type for the given file path.
     *
     * @param filePath - The full path to the file.
     *
     * @returns A valid mimetype.
     *
     * #### Notes
     * If a mime type cannot be found returns the defaul mime type `text/plain`, never `null`.
     */
    getMimeTypeByFilePath(filePath: string): string;
}
/**
 * A namespace for `IEditorMimeTypeService`.
 */
export declare namespace IEditorMimeTypeService {
    /**
     * The default mime type.
     */
    const defaultMimeType: string;
}
