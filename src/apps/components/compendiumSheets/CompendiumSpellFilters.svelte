<script>
    import { getContext } from "svelte";

    import CompendiumFilterCategory from "./CompendiumFilterCategory.svelte";

    export let compendiumType = "spell";

    const filterStore = getContext("filterStore");
    const { classSpellLists, spellLevels, spellSchools, spellComponents } = CONFIG.A5E;

    const products = Object.entries(CONFIG.A5E.products).reduce((acc, [key, value]) => {
        acc[key] = value.abbreviation;
        return acc;
    }, {});

    let filterSelections = {};

    filterStore.subscribe((store) => {
        filterSelections = store;
    });

    const formSectionMap = [
        {
            filterKey: "spellLists",
            heading: "Spell Lists",
            options: classSpellLists,
            display: compendiumType === "spell",
        },
        {
            filterKey: "spellLevels",
            heading: "Spell Levels",
            options: spellLevels,
        },
        {
            filterKey: "primarySpellSchools",
            heading:
                compendiumType === "spell" ? "Primary Spell Schools" : "Spell Schools",
            options: spellSchools.primary,
        },
        {
            filterKey: "secondarySpellSchools",
            heading: "Secondary Spell Schools",
            options: spellSchools.secondary,
            display: compendiumType === "spell",
        },
        {
            filterKey: "components",
            heading: "Components",
            options: spellComponents,
        },
        {
            filterKey: "miscellaneous",
            heading: "Miscellaneous",
            options: {
                concentration: "Concentration",
                rare: "Rare",
                ritual: "Ritual",
            },
        },
        {
            filterKey: "source",
            heading: "Source",
            options: products,
        },
    ];
</script>

{#each formSectionMap as { display, heading, filterKey, options }}
    {#if display ?? true}
        <CompendiumFilterCategory
            {filterKey}
            {filterSelections}
            {heading}
            {options}
            on:updateExclusiveMode={({ detail }) => {
                filterStore.update((currentFilterSelections) => ({
                    ...currentFilterSelections,
                    [filterKey]: {
                        inclusive: filterSelections[filterKey].inclusive,
                        inclusiveMode: filterSelections[filterKey].inclusiveMode,
                        exclusive: filterSelections[filterKey].exclusive,
                        exclusiveMode: detail,
                    },
                }));
            }}
            on:updateInclusiveMode={({ detail }) => {
                filterStore.update((currentFilterSelections) => ({
                    ...currentFilterSelections,
                    [filterKey]: {
                        inclusive: filterSelections[filterKey].inclusive,
                        inclusiveMode: detail,
                        exclusive: filterSelections[filterKey].exclusive,
                        exclusiveMode: filterSelections[filterKey].exclusiveMode,
                    },
                }));
            }}
            on:updateSelection={({ detail }) => {
                filterStore.update((currentFilterSelections) => ({
                    ...currentFilterSelections,
                    [filterKey]: {
                        inclusive: detail[0],
                        inclusiveMode: filterSelections[filterKey].inclusiveMode,
                        exclusive: detail[1],
                        exclusiveMode: filterSelections[filterKey].exclusiveMode,
                    },
                }));
            }}
        />
    {/if}
{/each}
