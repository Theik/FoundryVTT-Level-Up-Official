/**
 * @typedef {import("./_types.mjs").RegionData} RegionData
 * @typedef {import("../types.mjs").DocumentConstructionContext} DocumentConstructionContext
 */
/**
 * The Region Document.
 * Defines the DataSchema and common behaviors for a Region which are shared between both client and server.
 * @mixes RegionData
 */
export default class BaseRegion extends Document {
    /** @inheritdoc */
    static defineSchema(): {
        _id: fields.DocumentIdField;
        name: fields.StringField;
        color: fields.ColorField;
        shapes: fields.ArrayField;
        elevation: fields.SchemaField;
        behaviors: fields.EmbeddedCollectionField;
        locked: fields.BooleanField;
        flags: fields.ObjectField;
    };
    /**
     * Construct a Region document using provided data and context.
     * @param {Partial<RegionData>} data         Initial data from which to construct the Region
     * @param {DocumentConstructionContext} context   Construction context options
     */
    constructor(data: Partial<RegionData>, context: DocumentConstructionContext);
}
export type RegionData = import("./_types.mjs").RegionData;
export type DocumentConstructionContext = import("../types.mjs").DocumentConstructionContext;
import Document from "../abstract/document.mjs";
import * as fields from "../data/fields.mjs";
