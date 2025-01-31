import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  CommonModalComponent,
  CommonTagsInputComponent,
} from '../../../../../shared-standalone-component-lib/components';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FeatureFlagsService } from '../../../../../core/feature-flags/feature-flags.service';
import { CommonFormHelpersService } from '../../../../../shared/services/common-form-helpers.service';
import { FEATURE_FLAG_STATUS, FILTER_MODE } from 'upgrade_types';
import {
  AddFeatureFlagRequest,
  CommonTagInputType,
  FeatureFlag,
  FeatureFlagFormData,
  UpdateFeatureFlagRequest,
  UPSERT_FEATURE_FLAG_ACTION,
  UpsertFeatureFlagParams,
} from '../../../../../core/feature-flags/store/feature-flags.model';
import { BehaviorSubject, combineLatestWith, map, Observable, startWith, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ExperimentService } from '../../../../../core/experiments/experiments.service';
import { CommonTextHelpersService } from '../../../../../shared/services/common-text-helpers.service';
import isEqual from 'lodash.isequal';
import { CommonModalConfig } from '../../../../../shared-standalone-component-lib/components/common-modal/common-modal.types';

@Component({
  selector: 'upsert-add-feature-flag-modal',
  standalone: true,
  imports: [
    CommonModalComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
    CommonModule,
    NgTemplateOutlet,
    MatIcon,
    ReactiveFormsModule,
    TranslateModule,
    CommonTagsInputComponent,
  ],
  templateUrl: './upsert-feature-flag-modal.component.html',
  styleUrl: './upsert-feature-flag-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertFeatureFlagModalComponent {
  isLoadingUpsertFeatureFlag$ = this.featureFlagsService.isLoadingUpsertFeatureFlag$;
  isSelectedFeatureFlagUpdated$ = this.featureFlagsService.isSelectedFeatureFlagUpdated$;
  selectedFlag$ = this.featureFlagsService.selectedFeatureFlag$;
  appContexts$ = this.featureFlagsService.appContexts$;

  subscriptions = new Subscription();
  isInitialFormValueChanged$: Observable<boolean>;
  isPrimaryButtonDisabled$: Observable<boolean>;

  initialFormValues$ = new BehaviorSubject<FeatureFlagFormData>(null);

  featureFlagForm: FormGroup;
  CommonTagInputType = CommonTagInputType;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public config: CommonModalConfig<UpsertFeatureFlagParams>,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private featureFlagsService: FeatureFlagsService,
    private experimentService: ExperimentService,
    public dialogRef: MatDialogRef<UpsertFeatureFlagModalComponent>
  ) {}

  ngOnInit(): void {
    this.experimentService.fetchContextMetaData();
    this.createFeatureFlagForm();
    this.listenForFeatureFlagGetUpdated();
    this.listenOnNameChangesToUpdateKey();
    this.listenForIsInitialFormValueChanged();
    this.listenForPrimaryButtonDisabled();
  }

  createFeatureFlagForm(): void {
    const { sourceFlag, action } = this.config.params;
    const initialValues = this.deriveInitialFormValues(sourceFlag, action);

    this.featureFlagForm = this.formBuilder.group({
      name: [initialValues.name, Validators.required],
      key: [initialValues.key, Validators.required],
      description: [initialValues.description],
      appContext: [initialValues.appContext, Validators.required],
      tags: [initialValues.tags],
    });

    this.initialFormValues$.next(this.featureFlagForm.value);
  }

  deriveInitialFormValues(sourceFlag: FeatureFlag, action: string) {
    const name = action === UPSERT_FEATURE_FLAG_ACTION.EDIT ? sourceFlag?.name : '';
    const key = action === UPSERT_FEATURE_FLAG_ACTION.EDIT ? sourceFlag?.key : '';
    const description = sourceFlag?.description || '';
    const appContext = sourceFlag?.context?.[0] || '';
    const tags = sourceFlag?.tags || [];

    return { name, key, description, appContext, tags };
  }

  listenOnNameChangesToUpdateKey(): void {
    this.subscriptions.add(
      this.featureFlagForm.get('name')?.valueChanges.subscribe((name) => {
        const keyControl = this.featureFlagForm.get('key');
        if (keyControl && !keyControl.dirty) {
          keyControl.setValue(CommonTextHelpersService.convertStringToFeatureFlagKeyFormat(name));
        }
      })
    );
  }

  listenForIsInitialFormValueChanged() {
    this.isInitialFormValueChanged$ = this.featureFlagForm.valueChanges.pipe(
      startWith(this.featureFlagForm.value),
      map(() => !isEqual(this.featureFlagForm.value, this.initialFormValues$.value))
    );
    this.subscriptions.add(this.isInitialFormValueChanged$.subscribe());
  }

  listenForPrimaryButtonDisabled() {
    this.isPrimaryButtonDisabled$ = this.isLoadingUpsertFeatureFlag$.pipe(
      combineLatestWith(this.isInitialFormValueChanged$),
      map(([isLoading, isInitialFormValueChanged]) => isLoading || !isInitialFormValueChanged)
    );
    this.subscriptions.add(this.isPrimaryButtonDisabled$.subscribe());
  }

  // Close the modal once the feature flag list length changes, as that indicates actual success
  listenForFeatureFlagGetUpdated(): void {
    this.subscriptions.add(this.isSelectedFeatureFlagUpdated$.subscribe(() => this.closeModal()));
  }

  onPrimaryActionBtnClicked(): void {
    if (this.featureFlagForm.valid) {
      // Handle extra frontend form validation logic here?
      this.sendRequest(this.config.params.action, this.config.params.sourceFlag);
    } else {
      // If the form is invalid, manually mark all form controls as touched
      CommonFormHelpersService.triggerTouchedToDisplayErrors(this.featureFlagForm);
    }
  }

  sendRequest(action: UPSERT_FEATURE_FLAG_ACTION, sourceFlag?: FeatureFlag): void {
    const formData: FeatureFlagFormData = this.featureFlagForm.value;

    if (action === UPSERT_FEATURE_FLAG_ACTION.ADD || action === UPSERT_FEATURE_FLAG_ACTION.DUPLICATE) {
      this.createAddRequest(formData);
    } else if (action === UPSERT_FEATURE_FLAG_ACTION.EDIT && sourceFlag) {
      this.createEditRequest(formData, sourceFlag);
    } else {
      console.error('UpsertFeatureFlagModalComponent: sendRequest: Invalid action or missing sourceFlag');
    }
  }

  createAddRequest({ name, key, description, appContext, tags }: FeatureFlagFormData): void {
    const flagRequest: AddFeatureFlagRequest = {
      name,
      key,
      description,
      context: [appContext],
      tags,
      status: FEATURE_FLAG_STATUS.DISABLED,
      filterMode: FILTER_MODE.EXCLUDE_ALL,
      featureFlagSegmentInclusion: [],
      featureFlagSegmentExclusion: [],
    };

    this.featureFlagsService.addFeatureFlag(flagRequest);
  }

  createEditRequest(
    { name, key, description, appContext, tags }: FeatureFlagFormData,
    { id, status, filterMode, featureFlagSegmentInclusion, featureFlagSegmentExclusion }: FeatureFlag
  ): void {
    const flagRequest: UpdateFeatureFlagRequest = {
      id,
      name,
      key,
      description,
      context: [appContext],
      tags,
      status,
      filterMode,
      featureFlagSegmentInclusion,
      featureFlagSegmentExclusion,
    };

    this.featureFlagsService.updateFeatureFlag(flagRequest);
  }

  closeModal() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
