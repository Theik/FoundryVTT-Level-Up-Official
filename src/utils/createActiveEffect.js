// eslint-disable-next-line import/no-unresolved
import { localize } from '@typhonjs-fvtt/runtime/svelte/helper';

export default async function createEffect(document, effectType) {
  const updateData = {
    label: localize('A5E.effects.new'),
    icon: 'icons/svg/aura.svg',
    origin: document.uuid
  };

  foundry.utils.setProperty(updateData, 'flags.a5e.sort', 0);

  if (document.documentName === 'Item') {
    updateData.transfer = false;
    if (effectType === 'onUse') {
      foundry.utils.setProperty(updateData, 'flags.a5e.transferType', 'onUse');
    } else {
      foundry.utils.setProperty(updateData, 'flags.a5e.transferType', 'passive');
    }
  }

  if (effectType === 'inactive') updateData.disabled = true;

  const documents = await document.createEmbeddedDocuments('ActiveEffect', [updateData]);
  documents.forEach((d) => d?.sheet?.render(true));
}
