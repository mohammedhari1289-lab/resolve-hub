import { PrismaClient, type Priority, type Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTicketId } from "../src/lib/ids";

const prisma = new PrismaClient();
const daysAgo = (n: number, hours = 0) => new Date(Date.now() - n * 864e5 + hours * 36e5);
const FLOW: Status[] = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const REMARKS: Record<Status, string> = {
  SUBMITTED: "Complaint submitted",
  UNDER_REVIEW: "Complaint reviewed and assigned to the concerned team.",
  IN_PROGRESS: "Technician has started working on the issue.",
  RESOLVED: "Issue fixed and verified on site. Please confirm if everything works.",
  CLOSED: "Confirmed by the complainant. Closing this complaint.",
};

async function main() {
  await prisma.notification.deleteMany();
  await prisma.complaintHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const [it, hostel, acad, fac] = await Promise.all(
    [
      ["IT Services", "Network, accounts and software support"],
      ["Hostel & Housing", "Rooms, mess and hostel facilities"],
      ["Academics", "Classes, exams and results"],
      ["Facilities & Maintenance", "Electrical, plumbing and cleanliness"],
    ].map(([name, description]) => prisma.department.create({ data: { name, description } })),
  );

  const catDefs: [string, string, string][] = [
    ["Wi-Fi & Network", "Slow or unavailable internet on campus", it.id],
    ["Software & Accounts", "Portal login, email or licence problems", it.id],
    ["Hostel Room", "Furniture, locks and room-related issues", hostel.id],
    ["Mess & Food", "Food quality, hygiene and timings", hostel.id],
    ["Exams & Results", "Marks, hall tickets and revaluation", acad.id],
    ["Classes & Faculty", "Timetable, lectures and lab access", acad.id],
    ["Electricity & Plumbing", "Power cuts, leaks and water supply", fac.id],
    ["Cleanliness", "Washrooms, corridors and campus grounds", fac.id],
  ];
  const cats = await Promise.all(
    catDefs.map(([name, description, departmentId]) => prisma.category.create({ data: { name, description, departmentId } })),
  );
  const cat = (n: string) => cats.find((c) => c.name === n)!.id;

  const hash = (p: string) => bcrypt.hash(p, 10);
  const mkUser = async (name: string, email: string, pw: string, role: "USER" | "STAFF" | "ADMIN", departmentId?: string) =>
    prisma.user.create({ data: { name, email, role, departmentId, passwordHash: await hash(pw) } });

  const admin = await mkUser("Anita Rao", "admin@resolvehub.dev", "Admin@123", "ADMIN");
  const staff1 = await mkUser("Ravi Kulkarni", "staff1@resolvehub.dev", "Staff@123", "STAFF", it.id);
  const staff2 = await mkUser("Meera Joshi", "staff2@resolvehub.dev", "Staff@123", "STAFF", hostel.id);
  const staff3 = await mkUser("Suresh Patil", "staff3@resolvehub.dev", "Staff@123", "STAFF", fac.id);
  const user1 = await mkUser("Aarav Sharma", "user1@resolvehub.dev", "User@123", "USER");
  const user2 = await mkUser("Diya Nair", "user2@resolvehub.dev", "User@123", "USER");
  const user3 = await mkUser("Kabir Shetty", "user3@resolvehub.dev", "User@123", "USER");
  const users = [user1, user2, user3];

  type Seed = [string, string, string, Priority, Status, number, typeof staff1 | null, number];
  const complaints: Seed[] = [
    ["Wi-Fi drops every evening in Block C", "The Wi-Fi in Block C disconnects between 7 and 10 pm almost daily, which makes online lab submissions impossible.", "Wi-Fi & Network", "HIGH", "IN_PROGRESS", 0, staff1, 3],
    ["Cannot log in to the student portal", "The portal shows 'invalid credentials' even after resetting my password twice. I need access to download my hall ticket.", "Software & Accounts", "URGENT", "UNDER_REVIEW", 1, staff1, 1],
    ["Broken window latch in room 214", "The window latch in room 214 is broken and the window cannot be locked. Rain water is coming in at night.", "Hostel Room", "MEDIUM", "RESOLVED", 0, staff2, 9],
    ["Mess food served cold and late", "Dinner has been served 40 minutes late for the whole week and the food is cold by the time it reaches the last tables.", "Mess & Food", "MEDIUM", "SUBMITTED", 2, null, 0],
    ["Marks missing in internal assessment 2", "My internal assessment 2 marks for Data Structures are not showing in the result sheet though I attended the exam.", "Exams & Results", "HIGH", "IN_PROGRESS", 1, null, 4],
    ["Projector not working in Lab 3", "The projector in Lab 3 has not worked for two weeks and practical demonstrations are being held on a small monitor.", "Classes & Faculty", "LOW", "CLOSED", 2, staff1, 14],
    ["Water leakage in the library corridor", "There is a continuous leak from the ceiling near the library entrance. The floor is slippery and unsafe.", "Electricity & Plumbing", "URGENT", "IN_PROGRESS", 0, staff3, 2],
    ["Washrooms on the second floor not cleaned", "The second floor washrooms of the academic block have not been cleaned for three days.", "Cleanliness", "MEDIUM", "RESOLVED", 1, staff3, 6],
    ["Fan making loud noise in room 108", "The ceiling fan makes a loud grinding noise and wobbles heavily. It is unsafe to run it.", "Electricity & Plumbing", "HIGH", "UNDER_REVIEW", 2, staff3, 1],
    ["Email account storage full", "My college email says the storage is full though I have deleted most messages. I am missing important mails.", "Software & Accounts", "LOW", "SUBMITTED", 0, null, 0],
    ["Hostel gate timings not displayed", "The new hostel gate timings are not displayed anywhere and the guard gives different answers each day.", "Hostel Room", "LOW", "CLOSED", 2, staff2, 20],
    ["Lecture hall 5 has no working power sockets", "None of the power sockets in lecture hall 5 work, so students cannot charge laptops during long sessions.", "Electricity & Plumbing", "MEDIUM", "RESOLVED", 1, staff3, 11],
    ["Revaluation result delayed", "My revaluation request was filed 45 days ago and I have not received any update yet.", "Exams & Results", "HIGH", "SUBMITTED", 0, null, 0],
    ["Wi-Fi password rejected in library", "The library Wi-Fi rejects the new password shared in the notice. Several students have the same problem.", "Wi-Fi & Network", "MEDIUM", "RESOLVED", 2, staff1, 7],
  ];

  for (const [title, description, catName, priority, status, ui, staff, age] of complaints) {
    const created = daysAgo(age, -1);
    const reached = FLOW.indexOf(status);
    const c = await prisma.complaint.create({
      data: {
        ticketId: generateTicketId(created),
        title,
        description,
        priority,
        status,
        userId: users[ui].id,
        categoryId: cat(catName),
        assignedToId: staff?.id ?? null,
        createdAt: created,
        resolvedAt: reached >= 3 ? daysAgo(Math.max(age - 2, 0)) : null,
        resolution: reached >= 3 ? REMARKS.RESOLVED : null,
      },
    });
    for (let i = 0; i <= reached; i++) {
      const s = FLOW[i];
      await prisma.complaintHistory.create({
        data: {
          complaintId: c.id,
          actorId: s === "SUBMITTED" || s === "CLOSED" ? users[ui].id : staff?.id ?? admin.id,
          fromStatus: i === 0 ? null : FLOW[i - 1],
          toStatus: s,
          remark: REMARKS[s],
          createdAt: new Date(created.getTime() + i * 6 * 36e5),
        },
      });
    }
  }

  await prisma.notification.createMany({
    data: [
      { userId: user1.id, message: "Your complaint “Wi-Fi drops every evening in Block C” is now In Progress.", link: undefined },
      { userId: user1.id, message: "Your complaint “Broken window latch in room 214” was marked Resolved.", link: undefined },
      { userId: admin.id, message: "New complaint submitted: “Revaluation result delayed”.", link: undefined },
    ],
  });

  console.log("Seed complete.\n  admin@resolvehub.dev / Admin@123\n  staff1@resolvehub.dev / Staff@123\n  user1@resolvehub.dev / User@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
