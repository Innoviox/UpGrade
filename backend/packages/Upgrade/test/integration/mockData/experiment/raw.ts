export const experiment = {
  id: 'be3ae74f-370a-4015-93f3-7761d16f8b17',
  name: 'Test Experiment',
  description: 'Test Experiment Description',
  consistencyRule: 'individual',
  assignmentUnit: 'individual',
  postExperimentRule: 'continue',
  state: 'scheduled',
  startOn: new Date().toISOString(),
  group: 'teacher',
  context: ['home'],
  tags: [],
  queries: [],
  conditions: [
    {
      id: 'c22467b1-f0e9-4444-9517-cc03037bc079',
      name: 'Condition A',
      description: 'Condition A',
      assignmentWeight: 40,
      conditionCode: 'ConditionA',
      twoCharacterId: 'CA',
    },
    {
      id: 'd2702d3c-5e04-41a7-8766-1da8a95b72ce',
      name: 'Condition B',
      description: 'Condition B',
      assignmentWeight: 60,
      conditionCode: 'ConditionB',
      twoCharacterId: 'CB',
    },
  ],
  partitions: [
    {
      expPoint: 'CurriculumSequence',
      expId: 'W1',
      description: 'Partition on Workspace 1',
      twoCharacterId: 'W1',
    },
    {
      expPoint: 'CurriculumSequence',
      expId: 'W2',
      description: 'Partition on Workspace 2',
      twoCharacterId: 'W2',
    },
    {
      expPoint: 'CurriculumSequence',
      description: 'No Partition',
      twoCharacterId: 'NP',
    },
  ],
};

export const experimentSecond = {
  id: '8b0e562a-029e-4680-836c-7de6b2ef6ac9',
  name: 'Test Experiment',
  description: 'Test Experiment Description',
  consistencyRule: 'individual',
  assignmentUnit: 'individual',
  postExperimentRule: 'continue',
  state: 'scheduled',
  startOn: new Date().toISOString(),
  group: 'teacher',
  context: ['home'],
  tags: [],
  queries: [],
  conditions: [
    {
      id: 'bb8844a9-085b-4ceb-b893-eaaea3b739af',
      name: 'Condition A',
      description: 'Condition A',
      assignmentWeight: 40,
      conditionCode: 'ConditionA',
      twoCharacterId: 'BA',
    },
    {
      id: '439a6fef-901d-4f0c-bca8-25f06e9e6262',
      name: 'Condition B',
      description: 'Condition B',
      assignmentWeight: 60,
      conditionCode: 'ConditionB',
      twoCharacterId: 'BB',
    },
  ],
  partitions: [
    {
      expPoint: 'CurriculumSequence2',
      expId: 'W1',
      description: 'Partition on Workspace 1',
      twoCharacterId: 'X1',
    },
    {
      expPoint: 'CurriculumSequence2',
      expId: 'W2',
      description: 'Partition on Workspace 2',
      twoCharacterId: 'X2',
    },
  ],
};

export const experimentThird = {
  id: '3711346b-49d4-4f49-92b9-0d0ce7fa6e07',
  name: 'Test Experiment',
  description: 'Test Experiment Description',
  consistencyRule: 'individual',
  assignmentUnit: 'individual',
  postExperimentRule: 'continue',
  state: 'scheduled',
  startOn: new Date().toISOString(),
  group: 'teacher',
  context: ['home'],
  tags: [],
  queries: [],
  conditions: [
    {
      id: '74684fa9-fcd8-44ef-a2d1-b5bdf96076e1',
      name: 'Condition A',
      description: 'Condition A',
      assignmentWeight: 40,
      conditionCode: 'ConditionA',
      twoCharacterId: 'AA',
    },
    {
      id: '8c7b2951-f9a7-4d2e-a1ed-0572e1ede879',
      name: 'Condition B',
      description: 'Condition B',
      assignmentWeight: 60,
      conditionCode: 'ConditionB',
      twoCharacterId: 'AB',
    },
  ],
  partitions: [
    {
      expPoint: 'CurriculumSequence3',
      expId: 'W1',
      description: 'Partition on Workspace 1',
      twoCharacterId: 'Y1',
    },
    {
      expPoint: 'CurriculumSequence3',
      expId: 'W2',
      description: 'Partition on Workspace 2',
      twoCharacterId: 'Y2',
    },
  ],
};

export const experimentFourth = {
  id: '3711346b-49d4-4f49-92b9-0d0ce7fa6e08',
  name: 'Test Experiment 4',
  description: 'Test Experiment Description',
  consistencyRule: 'individual',
  assignmentUnit: 'individual',
  postExperimentRule: 'continue',
  state: 'scheduled',
  startOn: new Date().toISOString(),
  group: 'teacher',
  context: ['home'],
  tags: [],
  queries: [],
  conditions: [
    {
      id: '74684fa9-fcd8-44ef-a2d1-b5bdf96076e2',
      name: 'Condition A',
      description: 'Condition A',
      assignmentWeight: 55.5,
      conditionCode: 'ConditionA',
      twoCharacterId: 'AA',
    },
    {
      id: '8c7b2951-f9a7-4d2e-a1ed-0572e1ede878',
      name: 'Condition B',
      description: 'Condition B',
      assignmentWeight: 44.5,
      conditionCode: 'ConditionB',
      twoCharacterId: 'AB',
    },
  ],
  partitions: [
    {
      expPoint: 'CurriculumSequence3',
      expId: 'W1',
      description: 'Partition on Workspace 1',
      twoCharacterId: 'Y1',
    },
    {
      expPoint: 'CurriculumSequence3',
      expId: 'W2',
      description: 'Partition on Workspace 2',
      twoCharacterId: 'Y2',
    },
  ],
};