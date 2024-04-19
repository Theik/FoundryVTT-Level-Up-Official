import BaseActorA5e from './base';

import HitDiceManager from '../../managers/HitDiceManager';

export default class CharacterActorA5E extends BaseActorA5e {
  /**
   * @type {Record<string, ClassItemA5e>}
   */
  _classes;

  /**
   * @type {Record<string, any>}
   */
  classAutomationFlags;

  get classes() {
    if (this._classes !== undefined) return this._classes;

    this._classes = this.items.reduce((acc, item) => {
      if (item.type !== 'class') return acc;

      acc[item.slug] = item;
      return acc;
    }, {});

    return this._classes;
  }

  // -------------------------------------------------------------
  // Data Preparation Methods
  // -------------------------------------------------------------
  /**
   * Sets the order of when to prepare data.
   * @override
   */
  prepareData() {
    this._classes = undefined;
    this.classAutomationFlags = {};
    super.prepareData();
  }

  /**
   * Prepare base data for the actor.
   * @override
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Setup automation flags
    this.classAutomationFlags = {
      classes: this.getFlag('a5e', 'automateClasses') ?? true,
      hitDice: this.getFlag('a5e', 'automateHitDice') ?? true,
      hitPoints: this.getFlag('a5e', 'automateHitPoints') ?? true,
      spellResources: this.getFlag('a5e', 'automateSpellResources') ?? true
    };

    // Calculate the proficiency bonus for the character with a minimum value of 2.
    this.system.attributes.prof = Math.max(2, Math.floor((this.system.details.level + 7) / 4));
  }

  /**
   * Prepares derived data for the actor.
   * @override
   */
  prepareDerivedData() {
    this.HitDiceManager = new HitDiceManager(this, this.classAutomationFlags.hitDice);

    super.prepareDerivedData();
    const actorData = this.system;

    actorData.attributes.attunement.current = this.items.reduce((acc, curr) => {
      const { requiresAttunement, attuned } = curr.system;
      return (requiresAttunement && attuned) ? acc + 1 : acc;
    }, 0);

    // Update Hit Dice based on manager
    this.system.attributes.hitDice = foundry.utils.mergeObject(
      this.system.attributes.hitDice,
      this.HitDiceManager.bySize
    );

    this.prepareLevelData();
    this.prepareSpellResources();
  }

  /**
   * Prepares detailed level data for the actor.
   */
  prepareLevelData() {
    const { classes } = this;

    if (!this.classAutomationFlags.classes) {
      this.levels = {
        character: this.system.details.level,
        classes: {}
      };

      return;
    }

    const levelData = Object.values(classes ?? {}).reduce((acc, cls) => {
      const level = cls.classLevels;
      if (!level) return acc;

      acc.classes[cls.slug] = level;
      acc.character += level;
      return acc;
    }, { character: 0, classes: {} });

    this.levels = levelData;
  }

  prepareSpellResources() {
    const actorData = this.system;
    const { classes } = this;

    // TODO: Class Documents - Handle no automation option

    const grantedResources = {
      slots: [],
      additionalSlots: [],
      points: [],
      inventions: [],
      artifactCharges: []
    };

    Object.values(classes).forEach((cls) => {
      const { progressionType, resource } = cls?.casting ?? {};
      if (!progressionType) return;

      if (progressionType === 'multiplier') grantedResources.slots.push(cls);
      else if (resource === 'artifactCharges') grantedResources.artifactCharges.push(cls);
      else if (resource === 'inventions') grantedResources.inventions.push(cls);
      else if (resource === 'points') grantedResources.points.push(cls);
      else if (resource === 'slots') grantedResources.additionalSlots.push(cls);
    });

    // Handle single typed classes
    if (grantedResources.slots.length === 1) {
      const cls = grantedResources.slots[0];
      const { slots: classSlots } = cls.casting;

      Object.entries(classSlots).forEach(([level, slotCount]) => {
        const { max, override } = actorData.spellResources.slots[level];
        actorData.spellResources.slots[level].max = override || (max || 0) + (slotCount || 0);
      });
    }

    if (grantedResources.points.length === 1) {
      const cls = grantedResources.points[0];
      const { points } = cls.casting;
      const { max, override } = actorData.spellResources.points;

      actorData.spellResources.points.max = override || (max || 0) + (points || 0);
    }

    if (grantedResources.inventions.length === 1) {
      const cls = grantedResources.inventions[0];
      const { inventions } = cls.casting;
      const { max, override } = actorData.spellResources.inventions;

      actorData.spellResources.inventions.max = override || (max || 0) + (inventions || 0);
    }

    if (grantedResources.artifactCharges.length === 1) {
      const cls = grantedResources.artifactCharges[0];
      const { charges } = cls.casting;
      const { max, override } = actorData.spellResources.artifactCharges;
      actorData.spellResources.artifactCharges.max = override || (max || 0) + (charges || 0);
    }

    // Handle multi classed spellcasting for slots
    if (grantedResources.slots.length > 1) {
      const total = grantedResources.slots.reduce((acc, cls) => {
        const { classLevels } = cls;

        const progressionConfig = CONFIG.A5E.casterProgression[cls.casting.casterType];
        if (!progressionConfig) return acc;

        const roundFunc = progressionConfig.roundUp ? Math.ceil : Math.floor;
        return acc + roundFunc(classLevels * progressionConfig.multiplier);
      }, 0);

      CONFIG.A5E.SPELL_SLOT_TABLE[total].forEach((slotCount, idx) => {
        const { max, override } = actorData.spellResources.slots[idx + 1];
        actorData.spellResources.slots[idx + 1].max = override || (max || 0) + (slotCount || 0);
      });
    }

    // TODO: Class Documents - Handle multi classed spellcasting for points
    if (grantedResources.points.length > 1) {
      // DO SOMETHING
    }

    // Add additional spell slots
    grantedResources.additionalSlots.forEach((cls) => {
      const { slots } = cls.casting;

      Object.entries(slots).forEach(([level, slotCount]) => {
        const { max, override } = actorData.spellResources.slots[level];
        actorData.spellResources.slots[level].max = override || (max || 0) + (slotCount || 0);
      });
    });

    actorData.spellResources.knownSpells = Object.values(classes).reduce((acc, cls) => {
      const { knownSpells } = cls?.casting ?? {};
      if (!knownSpells) return acc;

      acc[cls.slug] = knownSpells;
      return acc;
    }, {});

    actorData.spellResources.knownCantrips = Object.values(classes).reduce((acc, cls) => {
      const { knownCantrips } = cls?.casting ?? {};
      if (!knownCantrips) return acc;

      acc[cls.slug] = knownCantrips;
      return acc;
    }, {});

    actorData.spellResources.maxSpellLevel = Object.values(classes).reduce((acc, cls) => {
      const { maxLevel } = cls?.casting ?? {};
      if (!maxLevel) return acc;

      acc[cls.slug] = maxLevel;
      return acc;
    }, {});
  }

  /**
   * @inheritdoc
   */
  getRollData(item = null) {
    const data = { ...super.getRollData(item) };

    data.level = this.levels?.character ?? data.level ?? this.system.details.level;
    data.classes = Object.entries(this.classes ?? {}).reduce((acc, [slug, cls]) => {
      acc[slug] = (cls.getRollData(item) ?? {})?.actorTransfer;
      return acc;
    }, {});

    return data;
  }

  // -------------------------------------------------------------
  // Resources Reset Handlers
  // -------------------------------------------------------------
  // TODO: Resource Manager - Move to resource manager
  async recoverExertionUsingHitDice() {
    const { current, max } = this.system.attributes.exertion;

    const [lowestAvailableHitDie] = Object.entries(this.system.attributes.hitDice).find(
      ([, { current: c, total: t }]) => c > 0 && t > 0
    );

    if (!lowestAvailableHitDie) {
      ui.notifications.warn(`${this.name} has no hit dice remaining.`);
      return;
    }

    const roll = await new Roll('1d4');

    // TODO: Chat Cards - Make the message prettier
    await roll.toMessage();
    const newExertion = Math.min((current ?? 0) + roll.total, max);
    const newHitDieCount = this.system.attributes.hitDice[lowestAvailableHitDie].current - 1;

    await this.update({
      'system.attributes': {
        'exertion.current': newExertion,
        [`hitDice.${lowestAvailableHitDie}.current`]: newHitDieCount
      }
    });
  }

  // -------------------------------------------------------------
  // Sheet Toggles
  // -------------------------------------------------------------
  toggleInspiration() {
    const currentState = this.system.attributes.inspiration;
    this.update({ 'system.attributes.inspiration': !currentState });

    if (currentState) {
      Hooks.callAll('a5e.inspirationUsed', this);
    } else {
      Hooks.callAll('a5e.inspirationGained', this);
    }
  }

  // -------------------------------------------------------------
  // Document Update Hooks
  // -------------------------------------------------------------
  /** @inheritdoc */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
  }

  /** @inheritdoc */
  async _preUpdate(changed, options, userId) {
    await super._preUpdate(changed, options, userId);
  }

  /** @inheritdoc */
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
  }

  /** @inheritdoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
  }
}
