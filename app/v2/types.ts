export type Intensity = "tense" | "arguing" | "losing-control";

export type Channel = "face-to-face" | "text" | "phone";

export type ReactionId =
  | "continue"
  | "agitated"
  | "crying"
  | "silent"
  | "space"
  | "wechat";

export type FlowStage =
  | "CALM_ENTRY"
  | "CONFLICT_INPUT"
  | "MICRO_ACTION_BODY"
  | "MICRO_ACTION_PHRASE"
  | "MICRO_ACTION_NEXT"
  | "MICRO_ACTION_AVOID"
  | "REACTION_SELECT"
  | "CONTINUE_LISTENING"
  | "CRYING_CHOICE"
  | "GIVE_SPACE"
  | "STAY_NEARBY"
  | "PHYSICAL_CONNECTION"
  | "DEESCALATION_CHECK"
  | "LISTENING_CAPACITY_CHECK"
  | "MOOD_SHIFT_ACTIVITY"
  | "CLOSE_FOR_NOW"
  | "PAUSE_PREP"
  | "WECHAT_PAUSE"
  | "PAUSE_MODE"
  | "READINESS_CHECK"
  | "RETURN_TO_LISTENING"
  | "ACUTE_COMPLETE"
  | "RELATIONSHIP_DEPOSIT"
  | "NEXT_TIME_PLAN";

export type DeescalationResult = "calmed" | "somewhat" | "not";

export type ContactPreference = "closeness" | "space" | "unclear";

export type PhysicalConnectionChoice =
  | "embrace"
  | "pat"
  | "hold-hand"
  | "sit-close"
  | "no-touch";

export type MoodShiftActivityId =
  | "warm-drink"
  | "small-home-task"
  | "quiet-same-room"
  | "short-walk"
  | "pick-a-snack"
  | "sit-outside";

export type BookmarkThemeId = "tide" | "sea-glass" | "morning-mist" | "sand" | "after-rain";

export type FlowContext = {
  description: string;
  intensity: Intensity;
  channel: Channel;
  reaction?: ReactionId;
  completedActions: string[];
  readiness?: "ready" | "not-ready";
  readinessAttempts: number;
  acuteInterventionCount: number;
  deescalation?: DeescalationResult;
  contactPreference?: ContactPreference;
  physicalConnectionChoice?: PhysicalConnectionChoice;
  physicalConnectionReturn?: "DEESCALATION_CHECK" | "ACUTE_COMPLETE";
  moodShiftActivity?: MoodShiftActivityId;
  positiveNote: string;
  bookmarkTheme: BookmarkThemeId;
  bookmarkWave: number;
  completionReason?: "calmed" | "closed-for-now";
  pauseStartedAt?: number;
  pauseReferenceMinutes: number;
  selectedLearningIds: string[];
  repairDraft: {
    impact: string;
    responsibility: string;
    behaviorChange: string;
    followUp: string;
  };
};

export type FlowState = {
  stage: FlowStage;
  context: FlowContext;
};

export type FlowAction =
  | { type: "START" }
  | { type: "UPDATE_DESCRIPTION"; value: string }
  | { type: "SET_INTENSITY"; value: Intensity }
  | { type: "SET_CHANNEL"; value: Channel }
  | { type: "COMPLETE_MICRO_ACTION"; actionId: string }
  | { type: "CONTINUE_URGENT"; actionId: string }
  | { type: "SELECT_REACTION"; reaction: ReactionId }
  | { type: "COMPLETE_REACTION_ACTION" }
  | { type: "SET_CRYING_PREFERENCE"; value: ContactPreference }
  | { type: "SELECT_PHYSICAL_CONNECTION"; value: PhysicalConnectionChoice }
  | { type: "COMPLETE_PHYSICAL_CONNECTION" }
  | { type: "SET_DEESCALATION"; value: DeescalationResult }
  | { type: "SET_LISTENING_CAPACITY"; value: "can-listen" | "cannot-listen" }
  | { type: "SELECT_MOOD_SHIFT"; value: MoodShiftActivityId }
  | { type: "COMPLETE_MOOD_SHIFT" }
  | { type: "SKIP_MOOD_SHIFT" }
  | { type: "COMPLETE_CLOSE" }
  | { type: "PREPARE_PAUSE" }
  | { type: "BEGIN_PAUSE"; at?: number }
  | { type: "CHECK_READINESS" }
  | { type: "SET_READINESS"; value: "ready" | "not-ready" }
  | { type: "RETURN_AND_LISTEN" }
  | { type: "OPEN_RELATIONSHIP_DEPOSIT" }
  | { type: "OPEN_NEXT_TIME_PLAN" }
  | { type: "UPDATE_POSITIVE_NOTE"; value: string }
  | { type: "SET_BOOKMARK_THEME"; value: BookmarkThemeId }
  | { type: "SET_BOOKMARK_WAVE"; value: number }
  | { type: "RESET" };

export type MicroActionContent = {
  eyebrow: string;
  title: string;
  instruction: string;
  rationale?: string;
  primaryAction: string;
  completionId: string;
};

export type ReactionBranch = {
  id: ReactionId;
  label: string;
  stage:
    | "CONTINUE_LISTENING"
    | "CRYING_CHOICE"
    | "GIVE_SPACE"
    | "PAUSE_PREP"
    | "WECHAT_PAUSE";
  title: string;
  phrase: string;
  action: string;
  avoid?: string;
};
