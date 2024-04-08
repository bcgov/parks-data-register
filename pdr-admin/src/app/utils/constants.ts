export class Constants {
  public static readonly dataIds = {
    ENTER_DATA_URL_PARAMS: 'enter-data-url-params',
    SEARCH_RESULTS: 'search-results',
    CURRENT_PROTECTED_AREA: 'current-protected-area',
    PROTECTED_AREA_PUT: 'protected-area-put',
    HISTORICAL_PROTECTED_AREA: 'historical-protected-area',
    CHANGELOG_SEARCH_RESULTS: 'changelog-search-results',
    CURRENT_SITES_LIST: 'current-sites-list',
    CURRENT_SITE: 'current-site',
    HISTORICAL_SITES: 'historical-sites',
    SITE_PUT: 'site-put'
  };

  public static readonly timeZoneIANA = 'America/Vancouver';

  public static readonly editTypes = {
    MINOR_EDIT_TYPE: 'minor',
    MAJOR_EDIT_TYPE: 'major',
    REPEAL_EDIT_TYPE: 'repeal',
    EDIT_REPEAL_EDIT_TYPE: 'edit-repeal'
  };

  public static readonly editRoutes = {
    MINOR_EDIT_ROUTE_SEGMENT: 'minor',
    MAJOR_EDIT_ROUTE_SEGMENT: 'major',
    REPEAL_EDIT_ROUTE_SEGMENT: 'repeal',
    EDIT_REPEAL_EDIT_ROUTE_SEGMENT: 'edit-repeal',
  };

  public static readonly putAttributes = [
    'effectiveDate',
    'legalName',
    'phoneticName',
    'displayName',
    'searchTerms',
    'audioClip',
    'notes',
    'lastVersionDate',
  ];
}
