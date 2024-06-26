<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";

    import ImportButton from "../ImportButton.svelte";

    import getDocumentSourceTooltip from "../../../utils/getDocumentSourceTooltip";
    import CompendiumDeleteButton from "../CompendiumDeleteButton.svelte";

    export let document;

    function getAttunementLabel(object) {
        return object.system.requiresAttunement
            ? localize("A5E.AttunementRequiredPrompt")
            : null;
    }

    function getObjectDetailsLabel(item) {
        const attunement = getAttunementLabel(item);
        const { price } = item.system;
        const rarity = getRarityLabel(item);

        if (rarity) {
            if (price && attunement)
                return `${rarity} (${attunement}; Cost ${price})`;
            if (price) return `${rarity} (Cost ${price})`;
            if (attunement) return `${rarity} (${attunement})`;

            return rarity;
        }

        if (price && attunement) return `${attunement}; Cost ${price}`;
        if (price) return `Cost ${price}`;
        if (attunement) return attunement;

        return null;
    }

    function getObjectSource(item) {
        if (typeof item.system.source !== "string") return null;

        const source = CONFIG.A5E.products[item.system.source];

        return source || null;
    }

    function getRarityLabel(object) {
        const { rarity } = object.system;

        if (!rarity || rarity === "mundane") return null;

        return itemRarity[rarity] ?? rarity;
    }

    function onDragStart(event) {
        const data = {
            type: collection.documentName,
            uuid: collection.getUuid(document._id),
        };
        return event.dataTransfer.setData("text/plain", JSON.stringify(data));
    }

    const collection = getContext("collection");
    const { itemRarity } = CONFIG.A5E;

    $: objectDetails = getObjectDetailsLabel(document);
    $: objectSource = getObjectSource(document);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<li
    class="a5e-item a5e-item--compendium-document"
    draggable="true"
    on:click={async () => {
        const doc =
            collection.get(document._id) ??
            (await collection.getDocument(document._id));
        doc.sheet?.render(true);
    }}
    on:dragstart={onDragStart}
>
    <img
        class="a5e-item__image a5e-item__image--compendium-document"
        src={document.img}
        alt={document.name}
    />

    <h3 class="a5e-item__name a5e-item__name--compendium-document">
        {document.name}

        {#if document.system?.requiresAttunement}
            <i
                class="a5e-item__icon fa-solid fa-link"
                data-tooltip="Requires Attunement"
                data-tooltip-direction="UP"
            />
        {/if}
    </h3>

    <span class="a5e-item__details">
        {#if objectSource?.abbreviation}
            <a
                class="a5e-item__source-tag"
                href={objectSource?.url}
                target="_blank"
                data-tooltip={getDocumentSourceTooltip(objectSource)}
                data-tooltip-class="a5e-tooltip a5e-tooltip--dark a5e-tooltip--document-source"
                on:click|stopPropagation
            >
                {objectSource?.abbreviation}
            </a>
        {/if}

        {objectDetails}
    </span>

    <ImportButton {document} />

    {#if !collection.locked}
        <CompendiumDeleteButton {document} />
    {/if}
</li>
