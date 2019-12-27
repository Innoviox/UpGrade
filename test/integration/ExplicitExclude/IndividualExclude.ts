import { individualAssignmentExperiment } from '../mockData/experiment/index';
import { Container } from 'typedi';
import { ExperimentService } from '../../../src/api/services/ExperimentService';
import { ExperimentAssignmentService } from '../../../src/api/services/ExperimentAssignmentService';
// import { Logger as WinstonLogger } from '../../../src/lib/logger';
import { EXPERIMENT_STATE } from 'ees_types';
import { multipleUsers } from '../mockData/users/index';
import { ExcludeService } from '../../../src/api/services/ExcludeService';

export default async function IndividualExclude(): Promise<void> {
  // const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const experimentAssignmentService = Container.get<ExperimentAssignmentService>(ExperimentAssignmentService);
  const excludeService = Container.get<ExcludeService>(ExcludeService);

  // experiment object
  const experimentObject = individualAssignmentExperiment;

  // create experiment
  await experimentService.create(individualAssignmentExperiment as any);
  let experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: experimentObject.state,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // change experiment status to Enrolling
  const experimentId = experiments[0].id;
  await experimentAssignmentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLING);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLING,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // store individual user over hereF
  const user = multipleUsers[0];

  let experimentCondition = await experimentAssignmentService.getAllExperimentConditions(user.id, user.group);
  expect(experimentCondition.length).not.toEqual(0);

  // add user in individual exclude
  const excludedUser = await excludeService.excludeUser(user.id);
  expect(excludedUser).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        userId: user.id,
      }),
    ])
  );

  experimentCondition = await experimentAssignmentService.getAllExperimentConditions(user.id, user.group);
  expect(experimentCondition.length).toEqual(0);
}
