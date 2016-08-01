import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../pages';
import * as types from '../../constants/actionTypes';
import { API } from '../../constants/api';
import nock from 'nock';
import expect from 'expect';

import { page, new_page } from './fixtures';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('Actions::Pages', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('creates FETCH_PAGES_SUCCESS when fetching pages has been done', () => {
    nock(API)
      .get('/pages')
      .reply(200, [page]);

    const expectedActions = [
      { type: types.FETCH_PAGES_REQUEST },
      { type: types.FETCH_PAGES_SUCCESS, pages: [page] }
    ];

    const store = mockStore({ pages: [], isFetching: false });

    return store.dispatch(actions.fetchPages())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('fetches the page', () => {
    let id = 'about';
    nock(API)
      .get(`/pages/${id}`)
      .reply(200, page);

    const expectedActions = [
      { type: types.FETCH_PAGE_REQUEST},
      { type: types.FETCH_PAGE_SUCCESS, page }
    ];

    const store = mockStore({ page: {}, isFetching: true });

    return store.dispatch(actions.fetchPage(id))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('deletes the page', () => {
    nock(API)
      .delete(`/pages/${page.name}`)
      .reply(200, { message: 'Deleted' });

    const expectedActions = [
      { id: page.name, type: types.DELETE_PAGE_SUCCESS }
    ];

    const store = mockStore({ message: "" });

    return store.dispatch(actions.deletePage(page.name))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates DELETE_PAGE_FAILURE when deleting page failed', () => {
    nock(API)
      .delete(`/pages/${page.name}`)
      .replyWithError('something awful happened');

    const expectedAction = {
      type: types.DELETE_PAGE_FAILURE,
      error: 'something awful happened'
    };

    const store = mockStore({ pages: [page] });

    return store.dispatch(actions.deletePage(page.name))
      .then(() => {
        expect(store.getActions()[0].type).toEqual(expectedAction.type);
      });
  });

  it('updates the page', () => {
    nock(API)
      .put(`/pages/${page.name}`)
      .reply(200, page);

    const expectedActions = [
      { type: types.CLEAR_ERRORS },
      { type: types.PUT_PAGE_SUCCESS, page }
    ];

    const store = mockStore({metadata: { metadata: page}});

    return store.dispatch(actions.putPage(page.name))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates the page', () => {
    nock(API)
      .put(`/pages/${new_page.path}`)
      .reply(200, page);

    const expectedActions = [
      { type: types.CLEAR_ERRORS },
      { type: types.PUT_PAGE_SUCCESS, page }
    ];

    const store = mockStore({metadata: { metadata: page}});

    return store.dispatch(actions.putPage())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates PUT_PAGE_FAILURE when updating page failed', () => {
    nock(API)
      .put(`/pages/${page.name}`)
      .replyWithError('something awful happened');

    const expectedActions = [
      { type: types.CLEAR_ERRORS },
      { type: types.PUT_PAGE_FAILURE, error: 'something awful happened' }
    ];

    const store = mockStore({metadata: { metadata: page}});

    return store.dispatch(actions.putPage(page.name))
      .then(() => {
        expect(store.getActions()[1].type).toEqual(expectedActions[1].type);
      });
  });

  it('creates VALIDATION_ERROR if required field is not provided.', () => {
    const expectedActions = [
      {
        type: types.VALIDATION_ERROR,
        errors: [
          "The filename is required."
        ]
      }
    ];

    const store = mockStore({metadata: { metadata: {} }});

    store.dispatch(actions.putPage(page.name));
    expect(store.getActions()).toEqual(expectedActions);
  });

});