import { h } from 'vue';

const VALID_LEVELS = new Set([1, 2, 3, 4, 5, 6]);

const heading = ({ id = null, level = 1 }, { slots }) => {
  const lvl = VALID_LEVELS.has(level) ? level : 1;
  return h(`h${lvl}`, { id: id || null }, slots.default ? slots.default() : []);
};
heading.inheritAttrs = false;

export default heading;
