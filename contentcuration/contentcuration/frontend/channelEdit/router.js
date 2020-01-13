import VueRouter from 'vue-router';
import { RouterNames } from './constants';
import Sandbox from 'shared/views/Sandbox';
import TreeView from './views/TreeView';
import store from './store';
import EditModal from 'edit_channel/uploader/views/EditModal';

const router = new VueRouter({
  routes: [
    {
      name: RouterNames.SANDBOX,
      path: '/sandbox/',
      component: Sandbox,
    },
    {
      name: RouterNames.TREE_ROOT_VIEW,
      path: '/',
      beforeEnter: (to, from, next) => {
        return store.dispatch('channel/loadChannel', store.state.currentChannel.currentChannelId).then(channel => {
          const nodeId = channel.root_id;
          return next({
            name: RouterNames.TREE_VIEW,
            params: {
              nodeId,
            },
          });
        });
      },
    },
    {
      name: RouterNames.TREE_VIEW,
      path: '/:nodeId',
      props: true,
      component: TreeView,
      beforeEnter: (to, from, next) => {
        const channelPromise = store.dispatch('channel/loadChannel', store.state.currentChannel.currentChannelId);
        const nodePromise = store.dispatch('contentNode/loadSummaryContentNode', to.params.nodeId);
        return Promise.all([channelPromise, nodePromise]).then(([channel, contentNode]) => next()).catch(err => console.log(err));
      },
      children: [
        {
          name: RouterNames.CONTENTNODE_DETAILS,
          path: 'details/:detailNodeId',
          props: true,
          component: EditModal,
        },
        {
          name: RouterNames.MULTI_CONTENTNODE_DETAILS,
          path: 'multidetails/:detailNodeIds',
          props: true,
          component: EditModal,
        },
      ],
    },
  ],
});

export default router;
