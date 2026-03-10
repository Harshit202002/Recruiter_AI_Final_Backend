import asyncHandler from "../utils/asyncHandler.js";
import errorResponse from "../utils/errorResponse.js";
import { getTenantModel } from "../utils/tenantModel.js";

// Get total offers for the user's company
export const getTotalOffers = asyncHandler(async (req, res, next) => {
    const Offer = req.tenant.Offer;
    const totalOffers = await Offer.countDocuments({ company: req.user.company });
    res.status(200).json({ success: true, totalOffers });
});

// Get total tickets for the user's company
export const getTotalTickets = asyncHandler(async (req, res, next) => {
    const Ticket = req.tenant.Ticket;
    const totalTickets = await Ticket.countDocuments({ role: "RMG", company: req.user.company });
    res.status(200).json({ success: true, totalTickets });
});

// Get recruiter and offer stats month-wise for the user's company
export const getRecruiterAndOfferStats = asyncHandler(async (req, res, next) => {
    const User = req.tenant.User;
    const Offer = req.tenant.Offer;
    const totalRecruiterMonthWise = await User.aggregate([
        { $match: { role: "HR", company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const currentYear = new Date().getFullYear();
    const offersMonthWise = await Offer.aggregate([
        {
            $match: {
                company: req.user.company,
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lt: new Date(`${currentYear + 1}-01-01`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                month: "$_id",
                count: 1,
                _id: 0
            }
        }
    ]);
    res.status(200).json({ success: true, totalRecruiterMonthWise, offersMonthWise });
});

// Get active HR and assigned HR stats month-wise
export const getActiveAndAssignedHRStats = asyncHandler(async (req, res, next) => {
    const User = req.tenant.User;
    const Offer = req.tenant.Offer;
    const activeHRMonthWise = await User.aggregate([
        { $match: { role: "HR", isActive: true, company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const assignedHRMonthWise = await Offer.aggregate([
        { $match: { assignedTo: { $ne: null }, company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    res.status(200).json({ success: true, activeHRMonthWise, assignedHRMonthWise });
});

// Get offers with due date >= today
export const getUpcomingOffers = asyncHandler(async (req, res, next) => {
    const Offer = req.tenant.Offer;
    const offers = await Offer.find({ dueDate: { $gte: new Date() } });
    res.status(200).json({ success: true, offers });
});

// Get candidate stats month-wise
export const getCandidateStats = asyncHandler(async (req, res, next) => {
    const Candidate = req.tenant.Candidate;
    const totalCandidateMonthWise = await Candidate.aggregate([
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const totalCandidates = await Candidate.countDocuments();
    res.status(200).json({ success: true, totalCandidateMonthWise, totalCandidates });
});

// (Re)define all remaining dashboard controller endpoints as exported functions below

export const getRecruiterMonthWiseStats = asyncHandler(async (req, res, next) => {
    const User = req.tenant.User;
    const Offer = req.tenant.Offer;
    const totalRecruiterMonthWise = await User.aggregate([
        { $match: { role: "HR", company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const currentYear = new Date().getFullYear();
    const offersMonthWise = await Offer.aggregate([
        {
            $match: {
                company: req.user.company,
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lt: new Date(`${currentYear + 1}-01-01`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                month: "$_id",
                count: 1,
                _id: 0
            }
        }
    ]);
    res.status(200).json({ success: true, totalRecruiterMonthWise, offersMonthWise });
});

export const getHRAndTicketMonthWiseStats = asyncHandler(async (req, res, next) => {
    const User = req.tenant.User;
    const Ticket = req.tenant.Ticket;
    const totalHRMonthWise = await User.aggregate([
        { $match: { role: "HR", company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const totalTicketsMonthWise = await Ticket.aggregate([
        { $match: { company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    res.status(200).json({ success: true, totalHRMonthWise, totalTicketsMonthWise });
});

export const getActiveAndAssignedHRMonthWiseStats = asyncHandler(async (req, res, next) => {
    const User = req.tenant.User;
    const Offer = req.tenant.Offer;
    const activeHRMonthWise = await User.aggregate([
        { $match: { role: "HR", isActive: true, company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const assignedHRMonthWise = await Offer.aggregate([
        { $match: { assignedTo: { $ne: null }, company: req.user.company } },
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    res.status(200).json({ success: true, activeHRMonthWise, assignedHRMonthWise });
});

export const getUpcomingOffersList = asyncHandler(async (req, res, next) => {
    const Offer = req.tenant.Offer;
    const offers = await Offer.find({ dueDate: { $gte: new Date() } });
    res.status(200).json({ success: true, offers });
});

export const getCandidateMonthWiseStats = asyncHandler(async (req, res, next) => {
    const Candidate = req.tenant.Candidate;
    const totalCandidateMonthWise = await Candidate.aggregate([
        { $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
        }}
    ]);
    const totalCandidates = await Candidate.countDocuments();
    res.status(200).json({ success: true, totalCandidateMonthWise, totalCandidates });
});

export const getRecentJobTittleswithnumberofvacancies = asyncHandler(async (req, res, next) => {
    const recentJobs = await Offer.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("jobTitle positionAvailable createdAt");

    const totalJobs = await Offer.countDocuments();
    res.status(200).json({ success: true, recentJobs, totalJobs });
});

export const getHRJobTittleswithnumberofvacancies = asyncHandler(async (req, res, next) => {
    const allJobs = await Offer.find()
    .sort({ createdAt: -1 })
    .select("jobTitle positionAvailable createdAt");

    // const totalJobs = await Offer.countDocuments();
    res.status(200).json({ success: true, allJobs });
});

export const getJdStatusPercentage = asyncHandler(async (req, res, next) => {
    const totalJds = await Offer.countDocuments();
    const openJds = await Offer.countDocuments({ status: "Open" });
    const inProgress = await Offer.countDocuments({ status: "In progress" });
    const jdPending = await Offer.countDocuments({ status: "JD pending" });
    const jdCreated = await Offer.countDocuments({ status: "JD created" });
    const closedJds = await Offer.countDocuments({ status: "Closed" });

    const openPercentage = totalJds ? (openJds / totalJds) * 100 : 0;
    const closedPercentage = totalJds ? (closedJds / totalJds) * 100 : 0;
    const inProgressPercentage = totalJds ? (inProgress / totalJds) * 100 : 0;
    const jdPendingPercentage = totalJds ? (jdPending / totalJds) * 100 : 0;
    const jdCreatedPercentage = totalJds ? (jdCreated / totalJds) * 100 : 0;

    res.status(200).json({
        success: true,
        jdStatusPercentage: {
            open: openPercentage,
            closed: closedPercentage,
            inProgress: inProgressPercentage,
            jdPending: jdPendingPercentage,
            jdCreated: jdCreatedPercentage
        }
    });
});

export const getallrecruitersandhisclosedpositions = asyncHandler(async (req, res, next) => {
    const recruiters = await User.find({ role: "HR" });

    const recruiterData = await Promise.all(recruiters.map(async (recruiter) => {
        
        const closedPositions = await Offer.countDocuments({ createdBy: recruiter._id, status: "Closed" });
        const activeJDs = await Offer.countDocuments({ createdBy: recruiter._id, status: { $ne: "Closed" } });
        const candidateShortlisted = await Candidate.countDocuments({ assignedRecruiter: recruiter._id, status: "Shortlisted" });
        const HRstatus = await User.findById(recruiter._id).select("isActive");
        return {
            recruiterName: recruiter.name,
            closedPositions,
            activeJDs,
            candidateShortlisted,
            isActive: HRstatus.isActive
        };
    }));

    res.status(200).json({ success: true, recruiterData });
});

//Recruiter Dashboard stats

export const getTotalFiltredandUnFilteredCandidatesFromAllJD = asyncHandler(async (req, res, next) => {
    const offers = await JD.find({ createdBy: req.user._id }).select("_id");
    const offerIds = offers.map(offer => offer._id);
    const totalFilteredCandidates = await Candidate.countDocuments({ offer: { $in: offerIds }, isFiltered: true });
    const totalUnfilteredCandidates = await Candidate.countDocuments({ offer: { $in: offerIds }, isFiltered: false });
    res.status(200).json({ success: true, totalFilteredCandidates, totalUnfilteredCandidates });
});
   

export const getTotalTicketOfSpecificHR = asyncHandler(async (req, res, next) => {
    const hrId = req.params.hrId;
    const totalTickets = await Ticket.countDocuments({ assignedTo: hrId });
    res.status(200).json({ success: true, totalTickets });
});

// Normalized aliases for dashboard routes compatibility
export const getTotalCandidateMonthWise = getCandidateMonthWiseStats;
export const getTotalTicketsRaisedByRMG = getTotalTickets;
export const getCurrentOffers = getUpcomingOffers;
export const getTotalRecruitersAndTotalOfferMonthWise = getRecruiterAndOfferStats;
export const getCountOfTotalHRandTicketsMonthWise = getHRAndTicketMonthWiseStats;
export const getCountOfActiveHRandAssignedHRMonthWise = getActiveAndAssignedHRStats;
