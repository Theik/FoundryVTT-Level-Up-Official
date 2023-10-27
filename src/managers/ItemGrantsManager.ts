import { grantsClassMappings } from '../config/registerGrantsConfig';

export default class ItemGrantsManager extends Map {
  #item: any;

  constructor(item: any) {
    super();

    this.#item = item;
    Object.entries(this.#item.system.grants ?? {}).forEach(([id, data]: Array<any>) => {
      data._id = id;

      let Cls = grantsClassMappings[data.grantType];

      // eslint-disable-next-line no-console
      if (!Cls) console.warn(`Grant ${id} has no class mapping.`);

      Cls ??= grantsClassMappings.default;
      const grant = new Cls(data, { parent: item });

      this.set(id, grant);
    });
  }

  /**
   * @param {String} type
   * @returns
   */
  byType(type: string): Array<any> {
    return [...this.values()].filter((grant) => grant.type === type);
  }

  /** ************************************************
  *               External methods
  * ************************************************ */
  async add(data = {}) {
    await ItemGrantsManager.addGrant(this.#item, data);
  }

  async clear() {
    await this.#item.update({
      'system.-=grants': null
    });

    await this.#item.update({ 'system.grants': {} });
  }

  async duplicate(id: string) {
    // @ts-ignore
    const newGrant = foundry.utils.duplicate(this.#item.system.grants[id]);
    newGrant.name = `${newGrant.name} (Copy)`;

    await this.#item.update({
      'system.grants': {
        ...this.#item.system.grants,
        // @ts-ignore
        [foundry.utils.randomID()]: newGrant
      }
    });
  }

  // @ts-ignore
  async delete(id: string) {
    super.delete(id);

    await this.#item.update({
      'system.grants': {
        [`-=${id}`]: null
      }
    });
  }

  /** ************************************************
  *                Static methods
  * ************************************************ */
  static async addGrant(item: any, data = {}, update = true) {
    // @ts-ignore
    const newGrant = foundry.utils.mergeObject({
      grantType: 'skill',
      level: 0
    }, data);

    const updateData = {
      'system.grants': {
        ...item.system.grants,
        // @ts-ignore
        [data?._id ?? foundry.utils.randomID()]: newGrant
      }
    };

    if (update) await item.update(updateData);
    return updateData;
  }
}