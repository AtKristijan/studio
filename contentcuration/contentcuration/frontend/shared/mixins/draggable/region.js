import { mapActions, mapGetters, mapState } from 'vuex';
import containerMixin from './container';
import { DraggableTypes } from './constants';

export default {
  mixins: [containerMixin],
  props: {
    draggableUniverse: {
      type: String,
      required: true,
    },
    draggableType: {
      default: DraggableTypes.REGION,
    },
  },
  computed: {
    ...mapState('draggable/regions', ['hoverDraggableSection', 'hoverDraggableTarget']),
    ...mapGetters('draggable/regions', ['activeDraggableId', 'hoverDraggableId']),
  },
  methods: {
    ...mapActions('draggable/regions', [
      'setHoverDraggable',
      'updateHoverDraggable',
      'resetHoverDraggable',
      'setActiveDraggableSize',
    ]),
  },
};
