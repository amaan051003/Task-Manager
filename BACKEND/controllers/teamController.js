const Team = require("../models/Team");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, paginateResponse } = require("../utils/pagination");

// @desc    Create a team
// @route   POST /api/teams
// @access  Private/Manager
const createTeam = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    const team = await Team.create({
      name,
      manager: req.user.id,
      members: members || [],
    });

    await team.populate([
      { path: "manager", select: "name email avatarColor" },
      { path: "members", select: "name email avatarColor role" },
    ]);

    return sendSuccess(res, 201, "Team created successfully.", { team });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let filter = {};
    if (req.user.role === "employee") {
      filter = { members: req.user.id };
    } else if (req.user.role === "manager") {
      filter = { manager: req.user.id };
    }

    const [teams, total] = await Promise.all([
      Team.find(filter)
        .populate("manager", "name email avatarColor")
        .populate("members", "name email avatarColor role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Team.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Teams fetched successfully.", paginateResponse(teams, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("manager", "name email avatarColor")
      .populate("members", "name email avatarColor role employeeId");

    if (!team) return sendError(res, 404, "Team not found.");

    const isTeamManager =
      req.user.role === "manager" &&
      team.manager._id.toString() === req.user.id;
    const isTeamMember =
      req.user.role === "employee" &&
      team.members.some((member) => member._id.toString() === req.user.id);

    if (!isTeamManager && !isTeamMember) {
      return sendError(res, 403, "You are not authorized to view this team.");
    }

    return sendSuccess(res, 200, "Team fetched successfully.", { team });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a team
// @route   PUT /api/teams/:id
// @access  Private/Manager
const updateTeam = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return sendError(res, 404, "Team not found.");

    if (team.manager.toString() !== req.user.id) {
      return sendError(res, 403, "Only the team manager can update this team.");
    }

    if (name) team.name = name;
    if (members) team.members = members;

    await team.save();
    await team.populate([
      { path: "manager", select: "name email avatarColor" },
      { path: "members", select: "name email avatarColor role" },
    ]);

    return sendSuccess(res, 200, "Team updated successfully.", { team });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private/Manager
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return sendError(res, 404, "Team not found.");

    if (team.manager.toString() !== req.user.id) {
      return sendError(res, 403, "Only the team manager can delete this team.");
    }

    await team.deleteOne();
    return sendSuccess(res, 200, "Team deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/add-member
// @access  Private/Manager
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return sendError(res, 404, "Team not found.");

    if (team.manager.toString() !== req.user.id) {
      return sendError(res, 403, "Only the team manager can add members.");
    }

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found.");

    if (team.members.map((m) => m.toString()).includes(userId)) {
      return sendError(res, 400, "User is already a member of this team.");
    }

    team.members.push(userId);
    await team.save();
    await team.populate([
      { path: "manager", select: "name email avatarColor" },
      { path: "members", select: "name email avatarColor role" },
    ]);

    return sendSuccess(res, 200, "Member added successfully.", { team });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from team
// @route   POST /api/teams/:id/remove-member
// @access  Private/Manager
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return sendError(res, 404, "Team not found.");

    if (team.manager.toString() !== req.user.id) {
      return sendError(res, 403, "Only the team manager can remove members.");
    }

    if (!team.members.map((m) => m.toString()).includes(userId)) {
      return sendError(res, 400, "User is not a member of this team.");
    }

    team.members = team.members.filter((m) => m.toString() !== userId);
    await team.save();

    return sendSuccess(res, 200, "Member removed successfully.", { team });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, getTeams, getTeam, updateTeam, deleteTeam, addMember, removeMember };
