import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  CommonSectionCardActionButtonsComponent,
  CommonSectionCardComponent,
  CommonSectionCardTitleHeaderComponent,
} from '../../../../../../../shared-standalone-component-lib/components';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IMenuButtonItem, SEGMENT_TYPE } from 'upgrade_types';
import { FeatureFlagExclusionsTableComponent } from './feature-flag-exclusions-table/feature-flag-exclusions-table.component';
import { FeatureFlagsService } from '../../../../../../../core/feature-flags/feature-flags.service';
import { DialogService } from '../../../../../../../shared/services/common-dialog.service';
import {
  PARTICIPANT_LIST_ROW_ACTION,
  ParticipantListRowActionEvent,
  ParticipantListTableRow,
} from '../../../../../../../core/feature-flags/store/feature-flags.model';
import {
  EditPrivateSegmentListDetails,
  EditPrivateSegmentListRequest,
  Segment,
} from '../../../../../../../core/segments/store/segments.model';

@Component({
  selector: 'app-feature-flag-exclusions-section-card',
  standalone: true,
  imports: [
    CommonSectionCardComponent,
    CommonSectionCardTitleHeaderComponent,
    CommonSectionCardActionButtonsComponent,
    CommonModule,
    FeatureFlagExclusionsTableComponent,
    TranslateModule,
  ],
  templateUrl: './feature-flag-exclusions-section-card.component.html',
  styleUrl: './feature-flag-exclusions-section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFlagExclusionsSectionCardComponent {
  @Input() isSectionCardExpanded;
  tableRowCount$ = this.featureFlagService.selectFeatureFlagExclusionsLength$;
  selectedFlag$ = this.featureFlagService.selectedFeatureFlag$;

  constructor(private featureFlagService: FeatureFlagsService, private dialogService: DialogService) {}
  menuButtonItems: IMenuButtonItem[] = [
    // { name: 'Import Exclude List', disabled: false },
    // { name: 'Export All Exclude Lists', disabled: false },
  ];

  onAddExcludeListClick(appContext: string, flagId: string) {
    this.dialogService.openAddExcludeListModal(appContext, flagId);
  }

  onMenuButtonItemClick(event) {
    console.log('Menu Button Item Clicked:', event);
  }

  onSectionCardExpandChange(isSectionCardExpanded: boolean) {
    this.isSectionCardExpanded = isSectionCardExpanded;
  }

  // Participant list row action events
  onRowAction(event: ParticipantListRowActionEvent, flagId: string): void {
    switch (event.action) {
      case PARTICIPANT_LIST_ROW_ACTION.EDIT:
        this.onEditExcludeList(event.rowData, flagId);
        break;
      case PARTICIPANT_LIST_ROW_ACTION.DELETE:
        this.onDeleteExcludeList(event.rowData.segment);
        break;
    }
  }

  onEditExcludeList(rowData: ParticipantListTableRow, flagId: string): void {
    this.dialogService.openEditExcludeListModal(rowData, rowData.segment.context, flagId);
  }

  createEditPrivateSegmentListDetails(segment: Segment): EditPrivateSegmentListDetails {
    const editPrivateSegmentListDetails: EditPrivateSegmentListDetails = {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      context: segment.context,
      type: SEGMENT_TYPE.PRIVATE,
      userIds: segment.individualForSegment.map((individual) => individual.userId),
      groups: segment.groupForSegment,
      subSegmentIds: segment.subSegments.map((subSegment) => subSegment.id),
    };

    return editPrivateSegmentListDetails;
  }

  sendUpdateFeatureFlagExclusionRequest(request: EditPrivateSegmentListRequest): void {
    this.featureFlagService.updateFeatureFlagExclusionPrivateSegmentList(request);
  }

  onDeleteExcludeList(segment: Segment): void {
    this.dialogService
      .openDeleteExcludeListModal(segment.name)
      .afterClosed()
      .subscribe((confirmClicked) => {
        if (confirmClicked) {
          this.featureFlagService.deleteFeatureFlagExclusionPrivateSegmentList(segment.id);
        }
      });
  }
}
