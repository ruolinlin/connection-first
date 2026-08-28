import { reactionBranches } from "./content.ts";
import type { FlowAction, FlowContext, FlowStage, FlowState } from "./types.ts";

export const initialFlowState: FlowState = {
  stage: "CALM_ENTRY",
  context: {
    description: "",
    intensity: "arguing",
    channel: "face-to-face",
    completedActions: [],
    readinessAttempts: 0,
    acuteInterventionCount: 0,
    positiveNote: "",
    bookmarkTheme: "tide",
    bookmarkWave: 0,
    pauseReferenceMinutes: 20,
    selectedLearningIds: [],
    repairDraft: {
      impact: "",
      responsibility: "",
      behaviorChange: "",
      followUp: "",
    },
  },
};

const nextMicroStage: Partial<Record<FlowStage, FlowStage>> = {
  MICRO_ACTION_BODY: "MICRO_ACTION_PHRASE",
  MICRO_ACTION_PHRASE: "MICRO_ACTION_NEXT",
  MICRO_ACTION_NEXT: "REACTION_SELECT",
  MICRO_ACTION_AVOID: "REACTION_SELECT",
};

function addCompletedAction(actions: string[], actionId: string) {
  return actions.includes(actionId) ? actions : [...actions, actionId];
}

function pauseStage(state: FlowState): "PAUSE_PREP" | "WECHAT_PAUSE" {
  return state.context.channel === "text" ? "WECHAT_PAUSE" : "PAUSE_PREP";
}

function completeReaction(state: FlowState, actionId: string): FlowState {
  return {
    stage: "DEESCALATION_CHECK",
    context: {
      ...state.context,
      acuteInterventionCount: Math.min(2, state.context.acuteInterventionCount + 1),
      deescalation: undefined,
      completedActions: addCompletedAction(state.context.completedActions, actionId),
    },
  };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "START":
      if (state.stage !== "CALM_ENTRY") return state;
      return { ...state, stage: "CONFLICT_INPUT" };
    case "UPDATE_DESCRIPTION":
      if (state.stage !== "CONFLICT_INPUT") return state;
      return { ...state, context: { ...state.context, description: action.value } };
    case "SET_INTENSITY":
      if (state.stage !== "CONFLICT_INPUT") return state;
      return { ...state, context: { ...state.context, intensity: action.value } };
    case "SET_CHANNEL":
      if (state.stage !== "CONFLICT_INPUT") return state;
      return { ...state, context: { ...state.context, channel: action.value } };
    case "COMPLETE_MICRO_ACTION": {
      if (state.stage === "CONFLICT_INPUT") return { ...state, stage: "MICRO_ACTION_BODY" };
      const next =
        state.stage === "MICRO_ACTION_PHRASE" &&
        state.context.intensity === "losing-control"
          ? "REACTION_SELECT"
          : nextMicroStage[state.stage];
      if (!next) return state;
      return {
        stage: next,
        context: {
          ...state.context,
          completedActions: addCompletedAction(state.context.completedActions, action.actionId),
        },
      };
    }
    case "CONTINUE_URGENT":
      if (state.stage !== "MICRO_ACTION_BODY" || state.context.intensity !== "losing-control") return state;
      return {
        stage: "MICRO_ACTION_PHRASE",
        context: {
          ...state.context,
          completedActions: addCompletedAction(state.context.completedActions, action.actionId),
        },
      };
    case "SELECT_REACTION":
      if (state.stage !== "REACTION_SELECT") return state;
      return {
        stage: reactionBranches[action.reaction].stage,
        context: {
          ...state.context,
          reaction: action.reaction,
          contactPreference: undefined,
          physicalConnectionChoice: undefined,
        },
      };
    case "COMPLETE_REACTION_ACTION":
      if (state.stage !== "CONTINUE_LISTENING" && state.stage !== "GIVE_SPACE" && state.stage !== "STAY_NEARBY") return state;
      return completeReaction(
        state,
        state.context.reaction ? `reaction:${state.context.reaction}` : `reaction:${state.stage.toLowerCase()}`,
      );
    case "SET_CRYING_PREFERENCE":
      if (state.stage !== "CRYING_CHOICE") return state;
      return {
        stage: action.value === "closeness" ? "PHYSICAL_CONNECTION" : action.value === "space" ? "GIVE_SPACE" : "STAY_NEARBY",
        context: {
          ...state.context,
          contactPreference: action.value,
          physicalConnectionChoice: undefined,
          physicalConnectionReturn: action.value === "closeness" ? "DEESCALATION_CHECK" : undefined,
        },
      };
    case "SELECT_PHYSICAL_CONNECTION":
      if (state.stage !== "PHYSICAL_CONNECTION") return state;
      return { ...state, context: { ...state.context, physicalConnectionChoice: action.value } };
    case "COMPLETE_PHYSICAL_CONNECTION":
      if (state.stage !== "PHYSICAL_CONNECTION" || !state.context.physicalConnectionChoice) return state;
      if (state.context.physicalConnectionReturn === "ACUTE_COMPLETE") {
        return {
          stage: "ACUTE_COMPLETE",
          context: {
            ...state.context,
            completionReason: "calmed",
            completedActions: addCompletedAction(
              state.context.completedActions,
              `physical:${state.context.physicalConnectionChoice}`,
            ),
          },
        };
      }
      return completeReaction(state, `physical:${state.context.physicalConnectionChoice}`);
    case "SET_DEESCALATION":
      if (state.stage !== "DEESCALATION_CHECK") return state;
      if (action.value === "calmed") {
        return {
          stage: "PHYSICAL_CONNECTION",
          context: {
            ...state.context,
            deescalation: action.value,
            physicalConnectionChoice: undefined,
            physicalConnectionReturn: "ACUTE_COMPLETE",
          },
        };
      }
      if (action.value === "somewhat") {
        return {
          stage: "MOOD_SHIFT_ACTIVITY",
          context: {
            ...state.context,
            deescalation: action.value,
            moodShiftActivity: undefined,
          },
        };
      }
      if (state.context.acuteInterventionCount >= 2) {
        return { stage: pauseStage(state), context: { ...state.context, deescalation: action.value } };
      }
      return { stage: "LISTENING_CAPACITY_CHECK", context: { ...state.context, deescalation: action.value } };
    case "SET_LISTENING_CAPACITY":
      if (state.stage !== "LISTENING_CAPACITY_CHECK") return state;
      return {
        stage: action.value === "can-listen" ? "REACTION_SELECT" : pauseStage(state),
        context: {
          ...state.context,
          completedActions:
            action.value === "can-listen"
              ? addCompletedAction(state.context.completedActions, "capacity:can-listen")
              : state.context.completedActions,
        },
      };
    case "SELECT_MOOD_SHIFT":
      if (state.stage !== "MOOD_SHIFT_ACTIVITY") return state;
      return {
        ...state,
        context: { ...state.context, moodShiftActivity: action.value },
      };
    case "COMPLETE_MOOD_SHIFT":
      if (state.stage !== "MOOD_SHIFT_ACTIVITY" || !state.context.moodShiftActivity) return state;
      return {
        stage: "ACUTE_COMPLETE",
        context: {
          ...state.context,
          completionReason: "closed-for-now",
          completedActions: addCompletedAction(
            state.context.completedActions,
            `mood-shift:${state.context.moodShiftActivity}`,
          ),
        },
      };
    case "SKIP_MOOD_SHIFT":
      if (state.stage !== "MOOD_SHIFT_ACTIVITY") return state;
      return { ...state, stage: "CLOSE_FOR_NOW" };
    case "COMPLETE_CLOSE":
      if (state.stage !== "CLOSE_FOR_NOW") return state;
      return {
        stage: "ACUTE_COMPLETE",
        context: {
          ...state.context,
          completionReason: "closed-for-now",
          completedActions: addCompletedAction(state.context.completedActions, "acute:closed-for-now"),
        },
      };
    case "PREPARE_PAUSE":
      return { ...state, stage: pauseStage(state) };
    case "BEGIN_PAUSE":
      if (state.stage !== "PAUSE_PREP" && state.stage !== "WECHAT_PAUSE") return state;
      return {
        stage: "PAUSE_MODE",
        context: {
          ...state.context,
          pauseStartedAt: action.at ?? Date.now(),
          readiness: undefined,
          completedActions: addCompletedAction(state.context.completedActions, "pause:prepared"),
        },
      };
    case "CHECK_READINESS":
      if (state.stage !== "PAUSE_MODE") return state;
      return { ...state, stage: "READINESS_CHECK" };
    case "SET_READINESS":
      if (state.stage !== "READINESS_CHECK") return state;
      return {
        stage: action.value === "not-ready" ? "PAUSE_MODE" : "RETURN_TO_LISTENING",
        context: {
          ...state.context,
          readiness: action.value,
          readinessAttempts: state.context.readinessAttempts + (action.value === "not-ready" ? 1 : 0),
          pauseStartedAt: action.value === "not-ready" ? Date.now() : state.context.pauseStartedAt,
          completedActions:
            action.value === "ready"
              ? addCompletedAction(state.context.completedActions, "pause:ready-to-listen")
              : state.context.completedActions,
        },
      };
    case "RETURN_AND_LISTEN":
      if (state.stage !== "RETURN_TO_LISTENING") return state;
      return {
        stage: "DEESCALATION_CHECK",
        context: {
          ...state.context,
          acuteInterventionCount: 2,
          deescalation: undefined,
          completedActions: addCompletedAction(state.context.completedActions, "return:listened"),
        },
      };
    case "OPEN_RELATIONSHIP_DEPOSIT":
      if (state.stage !== "ACUTE_COMPLETE" && state.stage !== "NEXT_TIME_PLAN") return state;
      return { ...state, stage: "RELATIONSHIP_DEPOSIT" };
    case "OPEN_NEXT_TIME_PLAN":
      if (state.stage !== "ACUTE_COMPLETE" && state.stage !== "RELATIONSHIP_DEPOSIT") return state;
      return { ...state, stage: "NEXT_TIME_PLAN" };
    case "UPDATE_POSITIVE_NOTE":
      if (state.stage !== "RELATIONSHIP_DEPOSIT") return state;
      return {
        ...state,
        context: { ...state.context, positiveNote: action.value.slice(0, 120) },
      };
    case "SET_BOOKMARK_THEME":
      if (state.stage !== "RELATIONSHIP_DEPOSIT") return state;
      return {
        ...state,
        context: { ...state.context, bookmarkTheme: action.value },
      };
    case "SET_BOOKMARK_WAVE":
      if (state.stage !== "RELATIONSHIP_DEPOSIT") return state;
      return {
        ...state,
        context: { ...state.context, bookmarkWave: Math.max(0, Math.min(2, action.value)) },
      };
    case "RESET":
      return initialFlowState;
    default:
      return state;
  }
}

export function isFlowState(value: unknown): value is FlowState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FlowState>;
  return typeof candidate.stage === "string" && Boolean(candidate.context);
}

/**
 * Browser history can contain snapshots written by an earlier V2 build.
 * Merge those snapshots with today's defaults before rendering so newly added
 * optional tools never have to assume that every persisted field already exists.
 */
export function normalizeFlowState(state: FlowState): FlowState {
  const saved = (state.context ?? {}) as Partial<FlowContext>;
  const bookmarkWave = Number.isFinite(saved.bookmarkWave)
    ? Math.max(0, Math.min(2, Number(saved.bookmarkWave)))
    : initialFlowState.context.bookmarkWave;

  return {
    stage: state.stage,
    context: {
      ...initialFlowState.context,
      ...saved,
      positiveNote:
        typeof saved.positiveNote === "string"
          ? saved.positiveNote
          : initialFlowState.context.positiveNote,
      bookmarkWave,
      completedActions: Array.isArray(saved.completedActions)
        ? [...saved.completedActions]
        : [],
      selectedLearningIds: Array.isArray(saved.selectedLearningIds)
        ? [...saved.selectedLearningIds]
        : [],
      repairDraft: {
        ...initialFlowState.context.repairDraft,
        ...(saved.repairDraft ?? {}),
      },
    },
  };
}
