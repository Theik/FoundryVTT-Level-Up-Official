export type DatabaseGetOperation = {
  /**
   * A query object which identifies the set of Documents retrieved
   */
  query: Record<string, any>;
  /**
   * Get requests are never broadcast
   */
  broadcast?: false;
  /**
   * Return indices only instead of full Document records
   */
  index?: boolean;
  /**
   * An array of field identifiers which should be indexed
   */
  indexFields?: string[];
  /**
   * A compendium collection ID which contains the Documents
   */
  pack?: string | null;
  /**
   * A parent Document within which Documents are embedded
   */
  parent?: foundry.abstract.Document | null;
  /**
   * A parent Document UUID provided when the parent instance is unavailable
   */
  parentUuid?: string;
};
export type DatabaseCreateOperation = {
  /**
   * Whether the database operation is broadcast to other connected clients
   */
  broadcast: boolean;
  /**
   * An array of data objects from which to create Documents
   */
  data: object[];
  /**
   * Retain the _id values of provided data instead of generating new ids
   */
  keepId?: boolean;
  /**
   * Retain the _id values of embedded document data instead of generating
   *    new ids for each embedded document
   */
  keepEmbeddedIds?: boolean;
  /**
   * The timestamp when the operation was performed
   */
  modifiedTime?: number;
  /**
   * Block the dispatch of hooks related to this operation
   */
  noHook?: boolean;
  /**
   * Re-render Applications whose display depends on the created Documents
   */
  render?: boolean;
  /**
   * Render the sheet Application for any created Documents
   */
  renderSheet?: boolean;
  /**
   * A parent Document within which Documents are embedded
   */
  parent?: foundry.abstract.Document | null;
  /**
   * A compendium collection ID which contains the Documents
   */
  pack: string | null;
  /**
   * A parent Document UUID provided when the parent instance is unavailable
   */
  parentUuid?: string | null;
};
export type DatabaseUpdateOperation = {
  /**
   * Whether the database operation is broadcast to other connected clients
   */
  broadcast: boolean;
  /**
   * An array of data objects used to update existing Documents.
   * Each update object must contain the _id of the target Document
   */
  updates: object[];
  /**
   * Difference each update object against current Document data and only use
   *               differential data for the update operation
   */
  diff?: boolean;
  /**
   * The timestamp when the operation was performed
   */
  modifiedTime?: number;
  /**
   * Merge objects recursively. If false, inner objects will be replaced
   *          explicitly. Use with caution!
   */
  recursive?: boolean;
  /**
   * Re-render Applications whose display depends on the created Documents
   */
  render?: boolean;
  /**
   * Block the dispatch of hooks related to this operation
   */
  noHook?: boolean;
  /**
   * A parent Document within which Documents are embedded
   */
  parent?: foundry.abstract.Document | null;
  /**
   * A compendium collection ID which contains the Documents
   */
  pack: string | null;
  /**
   * A parent Document UUID provided when the parent instance is unavailable
   */
  parentUuid?: string | null;
};
export type DatabaseDeleteOperation = {
  /**
   * Whether the database operation is broadcast to other connected clients
   */
  broadcast: boolean;
  /**
   * An array of Document ids which should be deleted
   */
  ids: string[];
  /**
   * Delete all documents in the Collection, regardless of _id
   */
  deleteAll?: boolean;
  /**
   * The timestamp when the operation was performed
   */
  modifiedTime?: number;
  /**
   * Block the dispatch of hooks related to this operation
   */
  noHook?: boolean;
  /**
   * Re-render Applications whose display depends on the deleted Documents
   */
  render?: boolean;
  /**
   * A parent Document within which Documents are embedded
   */
  parent?: foundry.abstract.Document | null;
  /**
   * A compendium collection ID which contains the Documents
   */
  pack: string | null;
  /**
   * A parent Document UUID provided when the parent instance is unavailable
   */
  parentUuid?: string | null;
};
export type DatabaseAction = 'get' | 'create' | 'update' | 'delete';
export type DatabaseOperation = DatabaseGetOperation | DatabaseCreateOperation | DatabaseUpdateOperation | DatabaseDeleteOperation;
export type DocumentSocketRequest = {
  /**
   * The type of Document being transacted
   */
  type: string;
  /**
   * The action of the request
   */
  action: DatabaseAction;
  /**
   * Operation parameters for the request
   */
  operation: DatabaseOperation;
  /**
   * The id of the requesting User
   */
  userId: string;
  /**
   * Should the response be broadcast to other connected clients?
   */
  broadcast: boolean;
};
