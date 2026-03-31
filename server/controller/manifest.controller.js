import Manifest from "../model/manifest.model.js";
import { sendMail } from "../utils/email.js";

export const createManifest = async (req, res) => {
  try {
    const {
      fullName = "",
      email = "",
      phone = "",
      projectType = "",
      projectDetails = "",
    } = req.body;

    if (!fullName.trim() || !email.trim() || !projectType.trim() || !projectDetails.trim()) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const manifest = await Manifest.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: String(phone || "").trim(),
      projectType: projectType.trim(),
      projectDetails: projectDetails.trim(),
    });

    const adminEmail = process.env.ADMIN_ALERT_EMAIL;
    if (adminEmail) {
      try {
        await sendMail({
          to: adminEmail,
          subject: "New Project Manifest Received",
          text: [
            `Name: ${manifest.fullName}`,
            `Email: ${manifest.email}`,
            `Phone: ${manifest.phone || "N/A"}`,
            `Project Type: ${manifest.projectType}`,
            `Details: ${manifest.projectDetails}`,
          ].join("\n"),
          html: `
            <div style="font-family: Arial, sans-serif; color: #1c1917; line-height: 1.6;">
              <h2>New Project Manifest</h2>
              <p><strong>Name:</strong> ${manifest.fullName}</p>
              <p><strong>Email:</strong> ${manifest.email}</p>
              <p><strong>Phone:</strong> ${manifest.phone || "N/A"}</p>
              <p><strong>Project Type:</strong> ${manifest.projectType}</p>
              <p><strong>Details:</strong><br />${manifest.projectDetails}</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("[MANIFEST_ADMIN_EMAIL_ERROR]:", mailErr.message);
      }
    }

    res.status(201).json({
      message: "Project inquiry submitted successfully.",
      manifest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit inquiry." });
  }
};

export const getAllManifests = async (_req, res) => {
  try {
    const manifests = await Manifest.find().sort({ createdAt: -1 });
    res.status(200).json({ manifests });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load manifests." });
  }
};

export const markManifestReviewed = async (req, res) => {
  try {
    const manifest = await Manifest.findByIdAndUpdate(
      req.params.id,
      { status: "reviewed" },
      { new: true, runValidators: true }
    );

    if (!manifest) {
      return res.status(404).json({ message: "Manifest not found." });
    }

    res.status(200).json({ message: "Manifest marked as reviewed.", manifest });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update manifest." });
  }
};
