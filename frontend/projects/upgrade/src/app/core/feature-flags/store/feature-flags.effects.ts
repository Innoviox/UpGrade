import { FeatureFlagsDataService } from '../feature-flags.data.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as FeatureFlagsActions from './feature-flags.actions';
import { catchError, switchMap, map, filter, withLatestFrom, tap, first } from 'rxjs/operators';
import { FeatureFlag, FeatureFlagsPaginationParams, NUMBER_OF_FLAGS } from './feature-flags.model';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState, NotificationService } from '../../core.module';
import {
  selectTotalFlags,
  selectSearchKey,
  selectSkipFlags,
  selectSortKey,
  selectSortAs,
  selectSearchString,
  selectIsAllFlagsFetched,
  selectSelectedFeatureFlag,
} from './feature-flags.selectors';
import { selectCurrentUser } from '../../auth/store/auth.selectors';
import { CommonExportHelpersService } from '../../../shared/services/common-export-helpers.service';
import { of } from 'rxjs';

@Injectable()
export class FeatureFlagsEffects {
  constructor(
    private store$: Store<AppState>,
    private actions$: Actions,
    private featureFlagsDataService: FeatureFlagsDataService,
    private router: Router,
    private notificationService: NotificationService,
    private commonExportHelpersService: CommonExportHelpersService
  ) {}

  fetchFeatureFlags$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionFetchFeatureFlags),
      map((action) => action.fromStarting),
      withLatestFrom(
        this.store$.pipe(select(selectSkipFlags)),
        this.store$.pipe(select(selectTotalFlags)),
        this.store$.pipe(select(selectSearchKey)),
        this.store$.pipe(select(selectSortKey)),
        this.store$.pipe(select(selectSortAs)),
        this.store$.pipe(select(selectIsAllFlagsFetched))
      ),
      filter(([fromStarting, skip, total, searchKey, sortKey, sortAs, isAllFlagsFetched]) => {
        return !isAllFlagsFetched || skip < total || total === null || fromStarting;
      }),
      tap(() => {
        this.store$.dispatch(FeatureFlagsActions.actionSetIsLoadingFeatureFlags({ isLoadingFeatureFlags: true }));
      }),
      switchMap(([fromStarting, skip, _, searchKey, sortKey, sortAs]) => {
        let searchString = null;
        // As withLatestFrom does not support more than 5 arguments
        // TODO: Find alternative
        this.getSearchString$().subscribe((searchInput) => {
          searchString = searchInput;
        });
        let params: FeatureFlagsPaginationParams = {
          skip: fromStarting ? 0 : skip,
          take: NUMBER_OF_FLAGS,
        };
        if (sortKey) {
          params = {
            ...params,
            sortParams: {
              key: sortKey,
              sortAs,
            },
          };
        }
        if (searchString) {
          params = {
            ...params,
            searchParams: {
              key: searchKey,
              string: searchString,
            },
          };
        }
        return this.featureFlagsDataService.fetchFeatureFlagsPaginated(params).pipe(
          switchMap((data: any) => {
            const actions = fromStarting ? [FeatureFlagsActions.actionSetSkipFlags({ skipFlags: 0 })] : [];
            return [
              ...actions,
              FeatureFlagsActions.actionFetchFeatureFlagsSuccess({ flags: data.nodes, totalFlags: data.total }),
            ];
          }),
          catchError(() => [FeatureFlagsActions.actionFetchFeatureFlagsFailure()])
        );
      })
    )
  );

  // actionCreateFeatureFlag dispatch POST feature flag
  addFeatureFlag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionAddFeatureFlag),
      switchMap((action) => {
        return this.featureFlagsDataService.addFeatureFlag(action.addFeatureFlagRequest).pipe(
          map((response) => FeatureFlagsActions.actionAddFeatureFlagSuccess({ response })),
          tap(({ response }) => {
            this.router.navigate(['/featureflags', 'detail', response.id]);
          }),
          catchError(() => [FeatureFlagsActions.actionAddFeatureFlagFailure()])
        );
      })
    )
  );

  updateFeatureFlag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionUpdateFeatureFlag),
      switchMap((action) => {
        return this.featureFlagsDataService.updateFeatureFlag(action.flag).pipe(
          map((response) => {
            return FeatureFlagsActions.actionUpdateFeatureFlagSuccess({ response });
          }),
          catchError(() => [FeatureFlagsActions.actionUpdateFeatureFlagFailure()])
        );
      })
    )
  );

  updateFeatureFlagStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionUpdateFeatureFlagStatus),
      switchMap((action) => {
        return this.featureFlagsDataService.updateFeatureFlagStatus(action.updateFeatureFlagStatusRequest).pipe(
          map((response) => {
            return FeatureFlagsActions.actionUpdateFeatureFlagStatusSuccess({ response });
          }),
          catchError(() => [FeatureFlagsActions.actionUpdateFeatureFlagStatusFailure()])
        );
      })
    )
  );

  updateFilterMode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionUpdateFilterMode),
      switchMap((action) => {
        return this.featureFlagsDataService.updateFilterMode(action.updateFilterModeRequest).pipe(
          map((response) => {
            return FeatureFlagsActions.actionUpdateFilterModeSuccess({ response });
          }),
          catchError(() => [FeatureFlagsActions.actionUpdateFilterModeFailure()])
        );
      })
    )
  );

  deleteFeatureFlag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionDeleteFeatureFlag),
      map((action) => action.flagId),
      filter((id) => !!id),
      switchMap((id) =>
        this.featureFlagsDataService.deleteFeatureFlag(id).pipe(
          map((data: any) => {
            this.router.navigate(['/featureflags']);
            return FeatureFlagsActions.actionDeleteFeatureFlagSuccess({ flag: data[0] });
          }),
          catchError(() => [FeatureFlagsActions.actionDeleteFeatureFlagFailure()])
        )
      )
    )
  );

  addFeatureFlagInclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionAddFeatureFlagInclusionList),
      switchMap((action) => {
        return this.featureFlagsDataService.addInclusionList(action.list).pipe(
          map((listResponse) => FeatureFlagsActions.actionAddFeatureFlagInclusionListSuccess({ listResponse })),
          catchError((error) => of(FeatureFlagsActions.actionAddFeatureFlagInclusionListFailure({ error })))
        );
      })
    )
  );

  updateFeatureFlagInclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionUpdateFeatureFlagInclusionList),
      switchMap((action) => {
        return this.featureFlagsDataService.updateInclusionList(action.list).pipe(
          map((listResponse) => FeatureFlagsActions.actionUpdateFeatureFlagInclusionListSuccess({ listResponse })),
          catchError((error) => of(FeatureFlagsActions.actionUpdateFeatureFlagInclusionListFailure({ error })))
        );
      })
    )
  );

  deleteFeatureFlagInclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionDeleteFeatureFlagInclusionList),
      map((action) => action.segmentId),
      switchMap((segmentId) => {
        return this.featureFlagsDataService.deleteInclusionList(segmentId).pipe(
          map(() => FeatureFlagsActions.actionDeleteFeatureFlagInclusionListSuccess({ segmentId })),
          catchError((error) => of(FeatureFlagsActions.actionDeleteFeatureFlagInclusionListFailure({ error })))
        );
      })
    )
  );

  addFeatureFlagExclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionAddFeatureFlagExclusionList),
      switchMap((action) => {
        return this.featureFlagsDataService.addExclusionList(action.list).pipe(
          map((listResponse) => FeatureFlagsActions.actionAddFeatureFlagExclusionListSuccess({ listResponse })),
          catchError((error) => of(FeatureFlagsActions.actionAddFeatureFlagExclusionListFailure({ error })))
        );
      })
    )
  );

  updateFeatureFlagExclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionUpdateFeatureFlagExclusionList),
      switchMap((action) => {
        return this.featureFlagsDataService.updateExclusionList(action.list).pipe(
          map((listResponse) => FeatureFlagsActions.actionUpdateFeatureFlagExclusionListSuccess({ listResponse })),
          catchError((error) => of(FeatureFlagsActions.actionUpdateFeatureFlagExclusionListFailure({ error })))
        );
      })
    )
  );

  deleteFeatureFlagExclusionList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionDeleteFeatureFlagExclusionList),
      map((action) => action.segmentId),
      switchMap((segmentId) => {
        return this.featureFlagsDataService.deleteExclusionList(segmentId).pipe(
          map(() => FeatureFlagsActions.actionDeleteFeatureFlagExclusionListSuccess({ segmentId })),
          catchError((error) => of(FeatureFlagsActions.actionDeleteFeatureFlagExclusionListFailure({ error })))
        );
      })
    )
  );

  fetchFeatureFlagsOnSearchString$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FeatureFlagsActions.actionSetSearchString),
        map((action) => action.searchString),
        tap((searchString) => {
          // Allow empty string as we erasing text from search input
          if (searchString !== null) {
            this.store$.dispatch(FeatureFlagsActions.actionFetchFeatureFlags({ fromStarting: true }));
          }
        })
      ),
    { dispatch: false }
  );

  fetchFlagsOnSearchKeyChange$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FeatureFlagsActions.actionSetSearchKey),
        withLatestFrom(this.store$.pipe(select(selectSearchString))),
        tap(([_, searchString]) => {
          if (searchString) {
            this.store$.dispatch(FeatureFlagsActions.actionFetchFeatureFlags({ fromStarting: true }));
          }
        })
      ),
    { dispatch: false }
  );

  fetchFeatureFlagById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionFetchFeatureFlagById),
      map((action) => action.featureFlagId),
      filter((featureFlagId) => !!featureFlagId),
      switchMap((featureFlagId) =>
        this.featureFlagsDataService.fetchFeatureFlagById(featureFlagId).pipe(
          map((data: FeatureFlag) => {
            return FeatureFlagsActions.actionFetchFeatureFlagByIdSuccess({ flag: data });
          }),
          catchError(() => [FeatureFlagsActions.actionFetchFeatureFlagByIdFailure()])
        )
      )
    )
  );

  emailFeatureFlagData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionEmailFeatureFlagData),
      map((action) => ({ featureFlagId: action.featureFlagId })),
      withLatestFrom(this.store$.pipe(select(selectCurrentUser))),
      filter(([{ featureFlagId }, { email }]) => !!featureFlagId && !!email),
      switchMap(([{ featureFlagId }, { email }]) =>
        this.featureFlagsDataService.emailFeatureFlagData(featureFlagId, email).pipe(
          map(() => {
            this.notificationService.showSuccess(`Email will be sent to ${email}`);
            return FeatureFlagsActions.actionEmailFeatureFlagDataSuccess();
          }),
          catchError(() => [FeatureFlagsActions.actionEmailFeatureFlagDataFailure()])
        )
      )
    )
  );
  exportFeatureFlagsDesign$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureFlagsActions.actionExportFeatureFlagDesign),
      map((action) => ({ featureFlagId: action.featureFlagId })),
      filter(({ featureFlagId }) => !!featureFlagId),
      switchMap(({ featureFlagId }) =>
        this.featureFlagsDataService.exportFeatureFlagsDesign(featureFlagId).pipe(
          map((data) => {
            if (data) {
              this.commonExportHelpersService.convertDataToDownload([data], 'FeatureFlags');
              this.notificationService.showSuccess('Feature Flag Design JSON downloaded!');
            }
            return FeatureFlagsActions.actionExportFeatureFlagDesignSuccess();
          }),
          catchError((error) => {
            this.notificationService.showError('Failed to export Feature Flag Design');
            return of(FeatureFlagsActions.actionExportFeatureFlagDesignFailure());
          })
        )
      )
    )
  );

  private getSearchString$ = () => this.store$.pipe(select(selectSearchString)).pipe(first());
}
