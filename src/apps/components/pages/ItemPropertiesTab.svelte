<script>
    import { getContext } from "svelte";

    import AmmunitionConfiguration from "../itemPropertiesConfig/AmmunitionConfiguration.svelte";
    import ArmorClassConfiguration from "../itemPropertiesConfig/ArmorClassConfiguration.svelte";
    import ArmorConfiguration from "../itemPropertiesConfig/ArmorConfiguration.svelte";
    import ContainerConfiguration from "../itemPropertiesConfig/ContainerConfiguration.svelte";
    import FeatureConfiguration from "../itemPropertiesConfig/FeatureConfiguration.svelte";
    import ManeuverConfiguration from "../itemPropertiesConfig/ManeuverConfiguration.svelte";
    import MaterialConfiguration from "../itemPropertiesConfig/MaterialConfiguration.svelte";
    import ObjectConfiguration from "../itemPropertiesConfig/ObjectConfiguration.svelte";
    import ShieldConfiguration from "../itemPropertiesConfig/ShieldConfiguration.svelte";
    import SpellConfiguration from "../itemPropertiesConfig/SpellConfiguration.svelte";
    import WeaponConfiguration from "../itemPropertiesConfig/WeaponConfiguration.svelte";
    import UsesConfiguration from "../itemPropertiesConfig/UsesConfiguration.svelte";

    const item = getContext("item");
</script>

<div class="a5e-page-wrapper a5e-page-wrapper--scrollable">
    {#if $item.type === "feature"}
        <FeatureConfiguration />
        <ArmorClassConfiguration />
    {:else if $item.type === "maneuver"}
        <ManeuverConfiguration />
    {:else if $item.type === "object"}
        <ObjectConfiguration />
        <MaterialConfiguration />
        {#if $item.system.objectType === "ammunition"}
            <AmmunitionConfiguration />
        {:else if $item.system.objectType === "armor"}
            <ArmorConfiguration />
        {:else if $item.system.objectType === "container"}
            <ContainerConfiguration />
        {:else if $item.system.objectType === "shield"}
            <ShieldConfiguration />
        {:else if $item.system.objectType === "weapon"}
            <WeaponConfiguration />
        {/if}
        <ArmorClassConfiguration />
    {:else if $item.type === "spell"}
        <SpellConfiguration />
    {/if}

    <UsesConfiguration />
</div>
