import PopulationFocus from '@entities/types/PopulationFocus';

import Field from './Field';

function getFieldForPopulationFocus(focus: PopulationFocus): Field {
  switch (focus) {
    case PopulationFocus.Speaking:
      return Field.PopulationSpeaking;
    case PopulationFocus.Writing:
      return Field.PopulationWriting;
    case PopulationFocus.Overall:
      return Field.Population;
  }
}

export default getFieldForPopulationFocus;
