// Génère la description Instagram d'une publication, dans le style des posts du club.
// Pas d'IA : des modèles inspirés des publications existantes, avec plusieurs variantes.
// Entrée : une liste de matchs normalisés {team, opp, a, b, win, forfait, derby, cup, sets, date}.
(function () {
  const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const TAGS = '#AizenayVolley #LesGriffons #VolleyBall #Aizenay';

  // petit générateur pseudo-aléatoire : la même « version » redonne le même texte
  function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  function weekendText(dates) {
    const ds = [...new Set(dates)].sort().map(d => new Date(d + 'T12:00'));
    if (!ds.length) return '';
    const a = ds[0], b = ds[ds.length - 1];
    if (a.getTime() === b.getTime()) return `du ${JOURS[a.getDay()]} ${a.getDate()} ${MOIS[a.getMonth()]}`;
    return a.getMonth() === b.getMonth() ? `du ${a.getDate()}-${b.getDate()} ${MOIS[a.getMonth()]} ${a.getFullYear()}`
      : `du ${a.getDate()} ${MOIS[a.getMonth()]} au ${b.getDate()} ${MOIS[b.getMonth()]} ${b.getFullYear()}`;
  }
  const dayText = d => { const x = new Date(d + 'T12:00'); return `${JOURS[x.getDay()]} ${x.getDate()} ${MOIS[x.getMonth()]}`; };
  const cupTitle = c => c.replace(/^1er tour( de)?/i, 'Premier tour de').replace(/\s+/g, ' ').toUpperCase();
  const cupInline = c => c.replace(/^1er tour( de)?\s*/i, 'le premier tour de ').replace(/^1\/(\d+) de finale( de)?\s*/i, 'les 1/$1 de finale de ').replace(/coupe de vend[ée]e/i, 'la Coupe de Vendée').replace(/^coupe/i, 'la Coupe');

  // « face à Les Sables » → « face aux Sables », « contre Les Sables » → « contre les Sables »
  const fa = o => /^les\s/i.test(o) ? 'aux ' + o.slice(4) : /^le\s/i.test(o) ? 'au ' + o.slice(3) : 'à ' + o;
  const ct = o => o.replace(/^(les|le|la)\s/i, w => w.toLowerCase());

  // une ligne par match : « 🏐 M18 Féminine : victoire 3-0 contre Luçon ! 💪 »
  function matchLine(m, r, single) {
    const sc = `${m.a}-${m.b}`;
    if (m.derby) return `🏐 Derby 100 % Aizenay : ${m.win ? `la ${m.team} s'impose ${sc} face à la ${m.opp}` : `la ${m.opp} s'impose face à la ${m.team}`} ! 💛💙`;
    if (m.forfait) return m.win ? `🏐 ${m.team} : victoire par forfait contre ${ct(m.opp)}.` : `🏐 ${m.team} : défaite par forfait face ${fa(m.opp)}.`;
    if (m.win) {
      if (m.b === 0) return `🏐 ${m.team} : ${pick(r, ['victoire', 'belle victoire', 'victoire nette'])} ${sc} contre ${ct(m.opp)} ! ${pick(r, ['💪', '🔥', '👏'])}`;
      if (m.a === 3 && m.b === 2 || m.a === 2 && m.b === 1) return `🏐 ${m.team} : victoire au tie-break ${sc} face ${fa(m.opp)}, quel match ! ${pick(r, ['🔥', '😮‍💨', '💪'])}`;
      return `🏐 ${m.team} : victoire ${sc} face ${fa(m.opp)} ! ${pick(r, ['💪', '👏', '🔥'])}`;
    }
    if (m.a === 2 && m.b === 3 || m.a === 1 && m.b === 2) return `🏐 ${m.team} : défaite au tie-break ${sc} face ${fa(m.opp)}, un match très accroché ! 💪`;
    return `🏐 ${m.team} : défaite ${sc} face ${fa(m.opp)}${single ? '.' : pick(r, [', on se reprend ! 💪', ', place au prochain match ! 💪', '.'])}`;
  }

  // description d'un week-end (série) ou d'un seul match
  function caption(list, opt = {}) {
    const r = rng(opt.seed || 1), out = [];
    if (!list.length) return '';
    const wins = list.filter(m => m.win).length, losses = list.length - wins;
    const cups = list.filter(m => m.cup), allCup = cups.length === list.length;
    const when = weekendText(list.map(m => m.date));
    const single = list.length === 1;

    // titre
    if (allCup) out.push(`🏆 ${cupTitle(cups[0].cup)} 🏐`);
    else if (wins === list.length && list.length > 1) out.push(pick(r, ['UN WEEK-END 100 % VICTOIRE CHEZ LES GRIFFONS ! 🏐', '🏐 100 % VICTOIRE POUR LES GRIFFONS CE WEEK-END ! 🏐']));
    else if (single) out.push(list[0].win ? pick(r, [`🏐 VICTOIRE POUR NOS GRIFFONS ! 🏐`, `💪 ${list[0].team.toUpperCase()} : VICTOIRE ${list[0].a}-${list[0].b} !`]) : pick(r, ['🏐 RÉSULTAT DU WEEK-END 🏐', `🏐 ${list[0].team.toUpperCase()} 🏐`]));
    else out.push(pick(r, ['🏐 LES RÉSULTATS DU WEEK-END !', '🏐 LES RÉSULTATS DU WEEK-END 🏐', `🏐 Résultats du week-end ${when} 🏐`]));
    out.push('');

    // introduction
    if (allCup) {
      const teams = [...new Set(list.map(m => m.team))];
      out.push(`Ce ${dayText(list[0].date)}, nos Griffons étaient engagés dans ${cupInline(cups[0].cup)} ! 💙💛`);
      if (teams.length > 1) out.push(`Au programme, nos équipes ${teams.slice(0, -1).join(', ')} et ${teams[teams.length - 1]} ont défendu les couleurs d'Aizenay sur le terrain. 💪🔥`);
    } else if (wins === list.length && list.length > 1) out.push('🔥 Ce week-end, nos équipes ont fait le plein de victoires !');
    else if (!single) out.push(pick(r, ['Un nouveau week-end de compétition pour nos Griffons !', 'Un week-end encore bien rempli pour les Griffons !', 'Un week-end de matchs pour nos Griffons ! 💪🏐']));

    // détail des matchs
    if (opt.detail !== false || single) {
      if (!single || !allCup) out.push('');
      list.forEach(m => out.push(matchLine(m, r, single)));
      if (single && list[0].sets && list[0].sets.length) out.push(`Détail des sets : ${list[0].sets.map(([x, y]) => `${x}-${y}`).join(', ')}`);
    }

    // bilan
    out.push('');
    if (allCup) out.push('Un week-end placé sous le signe de la compétition et de l\'esprit d\'équipe !');
    else if (single) out.push(list[0].win ? pick(r, ['Bravo à toute l\'équipe ! 👏', 'Bravo à toute l\'équipe pour cette belle performance ! 👏']) : pick(r, ['On garde la tête haute et on se remobilise pour la suite ! 💪', 'Bravo à l\'équipe pour son engagement, on se reprend dès le prochain match ! 💪']));
    else if (wins === list.length) out.push(pick(r, ['Bravo à toutes nos équipes pour leur engagement ! 👏', 'Des victoires et de belles performances sur les terrains. Bravo à toutes nos équipes ! 👏']));
    else if (losses === list.length) out.push('Un week-end plus compliqué pour nos équipes, mais toujours avec l\'envie et l\'esprit d\'équipe ! On se remobilise pour la suite 💪');
    else out.push(pick(r, ['Des victoires, des matchs disputés et de belles performances sur les terrains. Bravo à toutes nos équipes pour leur engagement !', 'Entre belles victoires, matchs accrochés et rencontres plus compliquées, nos équipes ont une nouvelle fois porté les couleurs d\'Aizenay sur les terrains.']));

    // remerciements et conclusion
    out.push('');
    out.push(pick(r, ['Merci à nos supporters pour leurs encouragements ! 💙', 'Bravo à tous les joueurs et joueuses, et merci aux supporters pour leur présence ! 👏', 'Merci à tous nos supporters ! 💙💛']));
    out.push('');
    out.push(pick(r, ['Rendez-vous le week-end prochain !', 'On continue, rendez-vous le week-end prochain ! 🦅', 'Rendez-vous le week-end prochain ! 💙💛']));
    if (opt.tags) { out.push(''); out.push(TAGS); }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  window.Description = { caption };
})();
