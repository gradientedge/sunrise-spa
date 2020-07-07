/* eslint-disable no-shadow */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import {
  withToken, groupFetchJson, makeConfig, baseUrl,
} from './api';

const productTypes = {
  getItem: withToken(
    ({ access_token: accessToken }) => groupFetchJson(
      `${baseUrl}/product-types/key=main`,
      makeConfig(accessToken),
    ),
  ),
  getItems: withToken(
    ({ access_token: accessToken }) => groupFetchJson(
      `${baseUrl}/product-types/`,
      makeConfig(accessToken),
    ),
  ),
  translations: () => productTypes.getItems().then(
    ({ results }) => results.map(
      ({ attributes }) => attributes,
    ).filter(x => x)
      .flat()
      .reduce(
        (result, { name, label }) => {
          result[name] = {
            ...label,
          };
          return result;
        }, {},
      ),
  ),
};

export default productTypes;
