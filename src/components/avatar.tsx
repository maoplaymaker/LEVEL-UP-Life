import { canWearOutfit, type AvatarState } from "@/lib/level-up-service";
import { cn } from "@/lib/utils";
import { AVATAR_ANCHORS } from "@/lib/avatar-anchors";
import type { CSSProperties } from "react";
import runner__asset from "@/assets/char_runner_full.png.asset.json";
const runner = runner__asset.url;
import hacker__asset from "@/assets/char_hacker_full.png.asset.json";
const hacker = hacker__asset.url;
import boss__asset from "@/assets/char_boss_noglasses.png.asset.json";
const boss = boss__asset.url;
import biker__asset from "@/assets/char_biker_full.png.asset.json";
const biker = biker__asset.url;
import athlete__asset from "@/assets/char_athlete_full.png.asset.json";
const athlete = athlete__asset.url;
import royal__asset from "@/assets/char_royal_full.png.asset.json";
const royal = royal__asset.url;
import luna__asset from "@/assets/char_luna.png.asset.json";
const luna = luna__asset.url;
import kai__asset from "@/assets/char_kai.png.asset.json";
const kai = kai__asset.url;
import amara__asset from "@/assets/char_amara.png.asset.json";
const amara = amara__asset.url;
import mateo__asset from "@/assets/char_mateo.png.asset.json";
const mateo = mateo__asset.url;
import sora__asset from "@/assets/char_sora.png.asset.json";
const sora = sora__asset.url;
import noor__asset from "@/assets/char_noor.png.asset.json";
const noor = noor__asset.url;
import erik__asset from "@/assets/char_erik.png.asset.json";
const erik = erik__asset.url;
import freya__asset from "@/assets/char_freya.png.asset.json";
const freya = freya__asset.url;
import liam__asset from "@/assets/char_liam.png.asset.json";
const liam = liam__asset.url;
import ruby__asset from "@/assets/char_ruby.png.asset.json";
const ruby = ruby__asset.url;
import omar__asset from "@/assets/char_omar_noglasses.png.asset.json";
const omar = omar__asset.url;
import priya__asset from "@/assets/char_priya.png.asset.json";
const priya = priya__asset.url;
import runnerPortrait__asset from "@/assets/portraits/runner_full.png.asset.json";
const runnerPortrait = runnerPortrait__asset.url;
import hackerPortrait__asset from "@/assets/portraits/hacker_full.png.asset.json";
const hackerPortrait = hackerPortrait__asset.url;
import bossPortrait__asset from "@/assets/portraits/boss_noglasses.png.asset.json";
const bossPortrait = bossPortrait__asset.url;
import bikerPortrait__asset from "@/assets/portraits/biker_full.png.asset.json";
const bikerPortrait = bikerPortrait__asset.url;
import athletePortrait__asset from "@/assets/portraits/athlete_full.png.asset.json";
const athletePortrait = athletePortrait__asset.url;
import royalPortrait__asset from "@/assets/portraits/royal_full.png.asset.json";
const royalPortrait = royalPortrait__asset.url;
import lunaPortrait__asset from "@/assets/portraits/luna.png.asset.json";
const lunaPortrait = lunaPortrait__asset.url;
import kaiPortrait__asset from "@/assets/portraits/kai.png.asset.json";
const kaiPortrait = kaiPortrait__asset.url;
import amaraPortrait__asset from "@/assets/portraits/amara.png.asset.json";
const amaraPortrait = amaraPortrait__asset.url;
import mateoPortrait__asset from "@/assets/portraits/mateo.png.asset.json";
const mateoPortrait = mateoPortrait__asset.url;
import soraPortrait__asset from "@/assets/portraits/sora.png.asset.json";
const soraPortrait = soraPortrait__asset.url;
import noorPortrait__asset from "@/assets/portraits/noor.png.asset.json";
const noorPortrait = noorPortrait__asset.url;
import erikPortrait__asset from "@/assets/portraits/erik.png.asset.json";
const erikPortrait = erikPortrait__asset.url;
import freyaPortrait__asset from "@/assets/portraits/freya.png.asset.json";
const freyaPortrait = freyaPortrait__asset.url;
import liamPortrait__asset from "@/assets/portraits/liam.png.asset.json";
const liamPortrait = liamPortrait__asset.url;
import rubyPortrait__asset from "@/assets/portraits/ruby.png.asset.json";
const rubyPortrait = rubyPortrait__asset.url;
import omarPortrait__asset from "@/assets/portraits/omar_noglasses.png.asset.json";
const omarPortrait = omarPortrait__asset.url;
import priyaPortrait__asset from "@/assets/portraits/priya.png.asset.json";
const priyaPortrait = priyaPortrait__asset.url;
import shepherd__asset from "@/assets/pet_shepherd.png.asset.json";
const shepherd = shepherd__asset.url;
import cat__asset from "@/assets/pet_cat.png.asset.json";
const cat = cat__asset.url;
import robofox__asset from "@/assets/pet_robofox.png.asset.json";
const robofox = robofox__asset.url;
import tabby__asset from "@/assets/pet_tabby_framed.png.asset.json";
const tabby = tabby__asset.url;
import rooftop__asset from "@/assets/scene_rooftop.jpg.asset.json";
const rooftop = rooftop__asset.url;
import studio__asset from "@/assets/scene_studio.jpg.asset.json";
const studio = studio__asset.url;
import coast__asset from "@/assets/scene_coast.jpg.asset.json";
const coast = coast__asset.url;
import streetOutfit__asset from "@/assets/wardrobe/outfit_street_complete.png.asset.json";
const streetOutfit = streetOutfit__asset.url;
import focusOutfit__asset from "@/assets/wardrobe/outfit_focus_complete.png.asset.json";
const focusOutfit = focusOutfit__asset.url;
import execOutfit__asset from "@/assets/wardrobe/outfit_exec_complete.png.asset.json";
const execOutfit = execOutfit__asset.url;
import execWomenOutfit__asset from "@/assets/wardrobe/outfit_exec_women_complete.png.asset.json";
const execWomenOutfit = execWomenOutfit__asset.url;
import championOutfit__asset from "@/assets/wardrobe/outfit_champion_complete.png.asset.json";
const championOutfit = championOutfit__asset.url;
import runnerStreetFitted__asset from "@/assets/wardrobe/char_runner_street_fitted.png.asset.json";
const runnerStreetFitted = runnerStreetFitted__asset.url;
import runnerFocusFitted__asset from "@/assets/wardrobe/char_runner_focus_fitted.png.asset.json";
const runnerFocusFitted = runnerFocusFitted__asset.url;
import hackerStreetFitted__asset from "@/assets/wardrobe/char_hacker_street_fitted.png.asset.json";
const hackerStreetFitted = hackerStreetFitted__asset.url;
import hackerFocusFitted__asset from "@/assets/wardrobe/char_hacker_focus_fitted.png.asset.json";
const hackerFocusFitted = hackerFocusFitted__asset.url;
import bossStreetFitted__asset from "@/assets/wardrobe/char_boss_street_fitted.png.asset.json";
const bossStreetFitted = bossStreetFitted__asset.url;
import bossFocusFitted__asset from "@/assets/wardrobe/char_boss_focus_fitted.png.asset.json";
const bossFocusFitted = bossFocusFitted__asset.url;
import bikerStreetFitted__asset from "@/assets/wardrobe/char_biker_street_fitted.png.asset.json";
const bikerStreetFitted = bikerStreetFitted__asset.url;
import bikerFocusFitted__asset from "@/assets/wardrobe/char_biker_focus_fitted.png.asset.json";
const bikerFocusFitted = bikerFocusFitted__asset.url;
import athleteStreetFitted__asset from "@/assets/wardrobe/char_athlete_street_fitted.png.asset.json";
const athleteStreetFitted = athleteStreetFitted__asset.url;
import athleteFocusFitted__asset from "@/assets/wardrobe/char_athlete_focus_fitted.png.asset.json";
const athleteFocusFitted = athleteFocusFitted__asset.url;
import royalStreetFitted__asset from "@/assets/wardrobe/char_royal_street_fitted.png.asset.json";
const royalStreetFitted = royalStreetFitted__asset.url;
import royalFocusFitted__asset from "@/assets/wardrobe/char_royal_focus_fitted.png.asset.json";
const royalFocusFitted = royalFocusFitted__asset.url;
import lunaStreetFitted__asset from "@/assets/wardrobe/char_luna_street_fitted.png.asset.json";
const lunaStreetFitted = lunaStreetFitted__asset.url;
import lunaFocusFitted__asset from "@/assets/wardrobe/char_luna_focus_fitted.png.asset.json";
const lunaFocusFitted = lunaFocusFitted__asset.url;
import kaiStreetFitted__asset from "@/assets/wardrobe/char_kai_street_fitted.png.asset.json";
const kaiStreetFitted = kaiStreetFitted__asset.url;
import kaiFocusFitted__asset from "@/assets/wardrobe/char_kai_focus_fitted.png.asset.json";
const kaiFocusFitted = kaiFocusFitted__asset.url;
import amaraStreetFitted__asset from "@/assets/wardrobe/char_amara_street_fitted.png.asset.json";
const amaraStreetFitted = amaraStreetFitted__asset.url;
import amaraFocusFitted__asset from "@/assets/wardrobe/char_amara_focus_fitted.png.asset.json";
const amaraFocusFitted = amaraFocusFitted__asset.url;
import mateoStreetFitted__asset from "@/assets/wardrobe/char_mateo_street_fitted.png.asset.json";
const mateoStreetFitted = mateoStreetFitted__asset.url;
import mateoFocusFitted__asset from "@/assets/wardrobe/char_mateo_focus_fitted.png.asset.json";
const mateoFocusFitted = mateoFocusFitted__asset.url;
import soraStreetFitted__asset from "@/assets/wardrobe/char_sora_street_fitted.png.asset.json";
const soraStreetFitted = soraStreetFitted__asset.url;
import soraFocusFitted__asset from "@/assets/wardrobe/char_sora_focus_fitted.png.asset.json";
const soraFocusFitted = soraFocusFitted__asset.url;
import noorStreetFitted__asset from "@/assets/wardrobe/char_noor_street_fitted.png.asset.json";
const noorStreetFitted = noorStreetFitted__asset.url;
import noorFocusFitted__asset from "@/assets/wardrobe/char_noor_focus_fitted.png.asset.json";
const noorFocusFitted = noorFocusFitted__asset.url;
import erikStreetFitted__asset from "@/assets/wardrobe/char_erik_street_fitted.png.asset.json";
const erikStreetFitted = erikStreetFitted__asset.url;
import erikFocusFitted__asset from "@/assets/wardrobe/char_erik_focus_fitted.png.asset.json";
const erikFocusFitted = erikFocusFitted__asset.url;
import freyaStreetFitted__asset from "@/assets/wardrobe/char_freya_street_fitted.png.asset.json";
const freyaStreetFitted = freyaStreetFitted__asset.url;
import freyaFocusFitted__asset from "@/assets/wardrobe/char_freya_focus_fitted.png.asset.json";
const freyaFocusFitted = freyaFocusFitted__asset.url;
import liamStreetFitted__asset from "@/assets/wardrobe/char_liam_street_fitted.png.asset.json";
const liamStreetFitted = liamStreetFitted__asset.url;
import liamFocusFitted__asset from "@/assets/wardrobe/char_liam_focus_fitted.png.asset.json";
const liamFocusFitted = liamFocusFitted__asset.url;
import rubyStreetFitted__asset from "@/assets/wardrobe/char_ruby_street_fitted.png.asset.json";
const rubyStreetFitted = rubyStreetFitted__asset.url;
import rubyFocusFitted__asset from "@/assets/wardrobe/char_ruby_focus_fitted.png.asset.json";
const rubyFocusFitted = rubyFocusFitted__asset.url;
import omarStreetFitted__asset from "@/assets/wardrobe/char_omar_street_fitted.png.asset.json";
const omarStreetFitted = omarStreetFitted__asset.url;
import omarFocusFitted__asset from "@/assets/wardrobe/char_omar_focus_fitted.png.asset.json";
const omarFocusFitted = omarFocusFitted__asset.url;
import priyaStreetFitted__asset from "@/assets/wardrobe/char_priya_street_fitted.png.asset.json";
const priyaStreetFitted = priyaStreetFitted__asset.url;
import priyaFocusFitted__asset from "@/assets/wardrobe/char_priya_focus_fitted.png.asset.json";
const priyaFocusFitted = priyaFocusFitted__asset.url;
import runnerExecFitted__asset from "@/assets/wardrobe/char_runner_exec_fitted.png.asset.json";
const runnerExecFitted = runnerExecFitted__asset.url;
import hackerExecFitted__asset from "@/assets/wardrobe/char_hacker_exec_women_fitted.png.asset.json";
const hackerExecFitted = hackerExecFitted__asset.url;
import bossExecFitted__asset from "@/assets/wardrobe/char_boss_exec_fitted.png.asset.json";
const bossExecFitted = bossExecFitted__asset.url;
import bikerExecFitted__asset from "@/assets/wardrobe/char_biker_exec_women_fitted.png.asset.json";
const bikerExecFitted = bikerExecFitted__asset.url;
import athleteExecFitted__asset from "@/assets/wardrobe/char_athlete_exec_fitted.png.asset.json";
const athleteExecFitted = athleteExecFitted__asset.url;
import royalExecFitted__asset from "@/assets/wardrobe/char_royal_exec_women_fitted.png.asset.json";
const royalExecFitted = royalExecFitted__asset.url;
import lunaExecFitted__asset from "@/assets/wardrobe/char_luna_exec_women_fitted.png.asset.json";
const lunaExecFitted = lunaExecFitted__asset.url;
import kaiExecFitted__asset from "@/assets/wardrobe/char_kai_exec_fitted.png.asset.json";
const kaiExecFitted = kaiExecFitted__asset.url;
import amaraExecFitted__asset from "@/assets/wardrobe/char_amara_exec_women_fitted.png.asset.json";
const amaraExecFitted = amaraExecFitted__asset.url;
import mateoExecFitted__asset from "@/assets/wardrobe/char_mateo_exec_fitted.png.asset.json";
const mateoExecFitted = mateoExecFitted__asset.url;
import soraExecFitted__asset from "@/assets/wardrobe/char_sora_exec_women_fitted.png.asset.json";
const soraExecFitted = soraExecFitted__asset.url;
import noorExecFitted__asset from "@/assets/wardrobe/char_noor_exec_women_fitted.png.asset.json";
const noorExecFitted = noorExecFitted__asset.url;
import erikExecFitted__asset from "@/assets/wardrobe/char_erik_exec_fitted.png.asset.json";
const erikExecFitted = erikExecFitted__asset.url;
import freyaExecFitted__asset from "@/assets/wardrobe/char_freya_exec_women_fitted.png.asset.json";
const freyaExecFitted = freyaExecFitted__asset.url;
import liamExecFitted__asset from "@/assets/wardrobe/char_liam_exec_fitted.png.asset.json";
const liamExecFitted = liamExecFitted__asset.url;
import rubyExecFitted__asset from "@/assets/wardrobe/char_ruby_exec_women_fitted.png.asset.json";
const rubyExecFitted = rubyExecFitted__asset.url;
import omarExecFitted__asset from "@/assets/wardrobe/char_omar_exec_fitted.png.asset.json";
const omarExecFitted = omarExecFitted__asset.url;
import priyaExecFitted__asset from "@/assets/wardrobe/char_priya_exec_women_fitted.png.asset.json";
const priyaExecFitted = priyaExecFitted__asset.url;
import runnerChampionFitted__asset from "@/assets/wardrobe/char_runner_champion_fitted.png.asset.json";
const runnerChampionFitted = runnerChampionFitted__asset.url;
import hackerChampionFitted__asset from "@/assets/wardrobe/char_hacker_champion_fitted.png.asset.json";
const hackerChampionFitted = hackerChampionFitted__asset.url;
import bossChampionFitted__asset from "@/assets/wardrobe/char_boss_champion_fitted.png.asset.json";
const bossChampionFitted = bossChampionFitted__asset.url;
import bikerChampionFitted__asset from "@/assets/wardrobe/char_biker_champion_fitted.png.asset.json";
const bikerChampionFitted = bikerChampionFitted__asset.url;
import athleteChampionFitted__asset from "@/assets/wardrobe/char_athlete_champion_fitted.png.asset.json";
const athleteChampionFitted = athleteChampionFitted__asset.url;
import royalChampionFitted__asset from "@/assets/wardrobe/char_royal_champion_fitted.png.asset.json";
const royalChampionFitted = royalChampionFitted__asset.url;
import lunaChampionFitted__asset from "@/assets/wardrobe/char_luna_champion_fitted.png.asset.json";
const lunaChampionFitted = lunaChampionFitted__asset.url;
import kaiChampionFitted__asset from "@/assets/wardrobe/char_kai_champion_fitted.png.asset.json";
const kaiChampionFitted = kaiChampionFitted__asset.url;
import amaraChampionFitted__asset from "@/assets/wardrobe/char_amara_champion_fitted.png.asset.json";
const amaraChampionFitted = amaraChampionFitted__asset.url;
import mateoChampionFitted__asset from "@/assets/wardrobe/char_mateo_champion_fitted.png.asset.json";
const mateoChampionFitted = mateoChampionFitted__asset.url;
import soraChampionFitted__asset from "@/assets/wardrobe/char_sora_champion_fitted.png.asset.json";
const soraChampionFitted = soraChampionFitted__asset.url;
import noorChampionFitted__asset from "@/assets/wardrobe/char_noor_champion_fitted.png.asset.json";
const noorChampionFitted = noorChampionFitted__asset.url;
import erikChampionFitted__asset from "@/assets/wardrobe/char_erik_champion_fitted.png.asset.json";
const erikChampionFitted = erikChampionFitted__asset.url;
import freyaChampionFitted__asset from "@/assets/wardrobe/char_freya_champion_fitted.png.asset.json";
const freyaChampionFitted = freyaChampionFitted__asset.url;
import liamChampionFitted__asset from "@/assets/wardrobe/char_liam_champion_fitted.png.asset.json";
const liamChampionFitted = liamChampionFitted__asset.url;
import rubyChampionFitted__asset from "@/assets/wardrobe/char_ruby_champion_fitted.png.asset.json";
const rubyChampionFitted = rubyChampionFitted__asset.url;
import omarChampionFitted__asset from "@/assets/wardrobe/char_omar_champion_fitted.png.asset.json";
const omarChampionFitted = omarChampionFitted__asset.url;
import priyaChampionFitted__asset from "@/assets/wardrobe/char_priya_champion_fitted.png.asset.json";
const priyaChampionFitted = priyaChampionFitted__asset.url;
import glassesAccessory__asset from "@/assets/wardrobe/acc_glasses_tight.png.asset.json";
const glassesAccessory = glassesAccessory__asset.url;
import headphonesAccessory__asset from "@/assets/wardrobe/acc_headphones_tight.png.asset.json";
const headphonesAccessory = headphonesAccessory__asset.url;
import watchAccessory__asset from "@/assets/wardrobe/acc_watch_tight.png.asset.json";
const watchAccessory = watchAccessory__asset.url;
import capAccessory__asset from "@/assets/wardrobe/acc_cap_tight.png.asset.json";
const capAccessory = capAccessory__asset.url;

export const CHARACTER_IMAGES: Record<string, string> = {
  char_runner: runner, char_hacker: hacker, char_boss: boss, char_biker: biker, char_athlete: athlete, char_royal: royal,
  char_luna: luna, char_kai: kai, char_amara: amara,
  char_mateo: mateo, char_sora: sora, char_noor: noor,
  char_erik: erik, char_freya: freya, char_liam: liam, char_ruby: ruby, char_omar: omar, char_priya: priya,
};

const CHARACTER_PORTRAITS: Record<string, string> = {
  char_runner: runnerPortrait, char_hacker: hackerPortrait, char_boss: bossPortrait, char_biker: bikerPortrait,
  char_athlete: athletePortrait, char_royal: royalPortrait, char_luna: lunaPortrait, char_kai: kaiPortrait,
  char_amara: amaraPortrait, char_mateo: mateoPortrait, char_sora: soraPortrait, char_noor: noorPortrait,
  char_erik: erikPortrait, char_freya: freyaPortrait, char_liam: liamPortrait, char_ruby: rubyPortrait,
  char_omar: omarPortrait, char_priya: priyaPortrait,
};

/** Fully dressed renders with the accessory worn, named `${character}__${outfit|base}__${accessory}.png`; missing combos fall back to the anchored overlay. */
const ACCESSORY_FITS: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<{ url: string }>("@/assets/accfit/*.png.asset.json", { eager: true, import: "default" })).map(([path, a]) => [path.split("/").pop()!.replace(".png.asset.json", ""), a.url]),
);

const SCENE_IMAGES: Record<string, string> = { scene_rooftop: rooftop, scene_studio: studio, scene_coast: coast };
const PET_IMAGES: Record<string, string> = { pet_shepherd: shepherd, pet_cat: cat, pet_robofox: robofox, pet_tabby: tabby };

const WARDROBE_IMAGES: Record<string, string> = {
  outfit_street: streetOutfit, outfit_focus: focusOutfit, outfit_exec: execOutfit, outfit_exec_women: execWomenOutfit, outfit_champion: championOutfit,
  acc_glasses: glassesAccessory, acc_headphones: headphonesAccessory, acc_watch: watchAccessory, acc_cap: capAccessory,
};

const FITTED_OUTFITS: Record<string, Record<string, string>> = {
  char_runner: { outfit_street: runnerStreetFitted, outfit_focus: runnerFocusFitted, outfit_exec: runnerExecFitted, outfit_champion: runnerChampionFitted },
  char_hacker: { outfit_street: hackerStreetFitted, outfit_focus: hackerFocusFitted, outfit_exec_women: hackerExecFitted, outfit_champion: hackerChampionFitted },
  char_boss: { outfit_street: bossStreetFitted, outfit_focus: bossFocusFitted, outfit_exec: bossExecFitted, outfit_champion: bossChampionFitted },
  char_biker: { outfit_street: bikerStreetFitted, outfit_focus: bikerFocusFitted, outfit_exec_women: bikerExecFitted, outfit_champion: bikerChampionFitted },
  char_athlete: { outfit_street: athleteStreetFitted, outfit_focus: athleteFocusFitted, outfit_exec: athleteExecFitted, outfit_champion: athleteChampionFitted },
  char_royal: { outfit_street: royalStreetFitted, outfit_focus: royalFocusFitted, outfit_exec_women: royalExecFitted, outfit_champion: royalChampionFitted },
  char_luna: { outfit_street: lunaStreetFitted, outfit_focus: lunaFocusFitted, outfit_exec_women: lunaExecFitted, outfit_champion: lunaChampionFitted },
  char_kai: { outfit_street: kaiStreetFitted, outfit_focus: kaiFocusFitted, outfit_exec: kaiExecFitted, outfit_champion: kaiChampionFitted },
  char_amara: { outfit_street: amaraStreetFitted, outfit_focus: amaraFocusFitted, outfit_exec_women: amaraExecFitted, outfit_champion: amaraChampionFitted },
  char_mateo: { outfit_street: mateoStreetFitted, outfit_focus: mateoFocusFitted, outfit_exec: mateoExecFitted, outfit_champion: mateoChampionFitted },
  char_sora: { outfit_street: soraStreetFitted, outfit_focus: soraFocusFitted, outfit_exec_women: soraExecFitted, outfit_champion: soraChampionFitted },
  char_noor: { outfit_street: noorStreetFitted, outfit_focus: noorFocusFitted, outfit_exec_women: noorExecFitted, outfit_champion: noorChampionFitted },
  char_erik: { outfit_street: erikStreetFitted, outfit_focus: erikFocusFitted, outfit_exec: erikExecFitted, outfit_champion: erikChampionFitted },
  char_freya: { outfit_street: freyaStreetFitted, outfit_focus: freyaFocusFitted, outfit_exec_women: freyaExecFitted, outfit_champion: freyaChampionFitted },
  char_liam: { outfit_street: liamStreetFitted, outfit_focus: liamFocusFitted, outfit_exec: liamExecFitted, outfit_champion: liamChampionFitted },
  char_ruby: { outfit_street: rubyStreetFitted, outfit_focus: rubyFocusFitted, outfit_exec_women: rubyExecFitted, outfit_champion: rubyChampionFitted },
  char_omar: { outfit_street: omarStreetFitted, outfit_focus: omarFocusFitted, outfit_exec: omarExecFitted, outfit_champion: omarChampionFitted },
  char_priya: { outfit_street: priyaStreetFitted, outfit_focus: priyaFocusFitted, outfit_exec_women: priyaExecFitted, outfit_champion: priyaChampionFitted },
};

export function WardrobeItem({ itemId, className }: { itemId: string; className?: string }) {
  const src = WARDROBE_IMAGES[itemId];
  if (!src) return null;
  return <span className={cn("block overflow-hidden bg-card", className)}><img src={src} alt="" loading="lazy" width={768} height={1024} className="h-full w-full object-contain" /></span>;
}

const auraClass: Record<string, string> = {
  aura_neon: "shadow-[inset_0_0_0_3px_var(--neon),inset_0_0_24px_var(--neon)]",
  aura_flame: "shadow-[inset_0_0_0_3px_var(--violet),inset_0_-30px_40px_-10px_var(--violet)]",
  aura_gold: "shadow-[inset_0_0_0_3px_var(--gold),inset_0_0_30px_var(--gold)]",
};

export function PetFigure({ pet, className }: { pet: string; className?: string }) {
  return <span aria-hidden="true" className={cn("pet-figure relative block overflow-hidden", className)}><img src={PET_IMAGES[pet] ?? tabby} alt="" loading="eager" width={640} height={768} className="h-full w-full object-contain object-bottom" /></span>;
}

export function AvatarPortrait({ avatar, className }: { avatar: AvatarState; className?: string }) {
  const character = avatar.equipped.character ?? "char_runner";
  return <span className={cn("block overflow-hidden bg-card", className)} aria-hidden="true"><img src={CHARACTER_PORTRAITS[character] ?? runnerPortrait} alt="" width={256} height={256} className="h-full w-full object-cover" /></span>;
}

export function AvatarFigure({ avatar, className, priority = false }: { avatar: AvatarState; className?: string; priority?: boolean }) {
  const { character, scene, pet, aura, outfit, accessory } = avatar.equipped;
  const src = CHARACTER_IMAGES[character ?? "char_runner"] ?? runner;
  const wearableOutfit = outfit && canWearOutfit(character, outfit) ? outfit : null;
  const fittedOutfit = wearableOutfit ? FITTED_OUTFITS[character ?? "char_runner"]?.[wearableOutfit] : undefined;
  const sceneImage = scene ? SCENE_IMAGES[scene] : undefined;
  const a = AVATAR_ANCHORS[`${character ?? "char_runner"}|${fittedOutfit ? wearableOutfit : "base"}`] ?? AVATAR_ANCHORS["char_runner|base"]!;
  const accessoryFit = accessory ? ACCESSORY_FITS[`${character ?? "char_runner"}__${fittedOutfit ? wearableOutfit : "base"}__${accessory}`] : undefined;
  const anchorStyle = { "--fx": a.fx, "--top": a.top, "--hh": a.hs * 0.13, "--wx": a.wx, "--wy": a.wy } as CSSProperties;
  return (
    <div data-character={character ?? "char_runner"} className={cn("avatar-stage relative overflow-hidden", `scene-${(scene ?? "scene_city").replace("scene_", "")}`, className)} aria-hidden="true">
      {sceneImage && <img src={sceneImage} alt="" loading="lazy" width={1536} height={256} className="avatar-scene-image" />}
      <div className="avatar-body" style={anchorStyle}>
      {(!wearableOutfit || fittedOutfit) && <img src={accessoryFit ?? fittedOutfit ?? src} alt="" loading={priority ? "eager" : "lazy"} width={768} height={1024} className="avatar-character absolute inset-0 h-full w-full object-contain object-bottom" />}
      {wearableOutfit && !fittedOutfit && WARDROBE_IMAGES[wearableOutfit] && <>
        <img src={WARDROBE_IMAGES[wearableOutfit]} alt="" loading="lazy" width={896} height={1200} className="avatar-worn-outfit pointer-events-none absolute z-[3] object-contain object-bottom" />
        <img src={src} alt="" loading={priority ? "eager" : "lazy"} width={768} height={1024} className="avatar-original-head pointer-events-none absolute inset-0 z-[4] h-full w-full object-contain object-bottom" />
      </>}
      {accessory && !accessoryFit && WARDROBE_IMAGES[accessory] && <img src={WARDROBE_IMAGES[accessory]} alt="" loading="lazy" width={768} height={768} className={cn("avatar-acc pointer-events-none absolute z-[5]", `avatar-worn-${accessory}`)} />}
      </div>
      {pet && <span className="avatar-pet"><img src={PET_IMAGES[pet] ?? tabby} alt="" loading={priority ? "eager" : "lazy"} width={640} height={768} className="h-full w-full object-contain object-bottom" /></span>}
      {aura && <span className={cn("pointer-events-none absolute inset-0", auraClass[aura])} />}
    </div>
  );
}
