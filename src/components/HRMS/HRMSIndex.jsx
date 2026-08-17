import React, { useState } from "react";
import {
  Users,
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle,
  Calendar,
  Settings,
} from "lucide-react";

// Import all HRMS components
import EmployeeRegistrationForm from "./EmployeeRegistrationForm";
import GeoAttendanceMonitoring from "./GeoAttendanceMonitoring";
import AttendanceMasterPage from "./AttendanceMasterPage";
import GenerateSalarySlip from "./GenerateSalarySlip";
import LeaveApproval from "./LeaveApproval";
import ShiftManagement from "./ShiftManagement";

const HRMSIndex = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  const hrmsModules = [
    {
      id: "employee-registration",
      title: "Employee Registration",
      description: "Register new employees with face recognition",
      icon: Users,
      color: "bg-blue-500",
      component: EmployeeRegistrationForm,
      features: [
        "Face image capture",
        "Complete employee data",
        "Bank details management",
        "Multiple salary structures",
      ],
    },
    {
      id: "geo-attendance",
      title: "Geo Attendance Monitoring",
      description: "Location-based attendance with face verification",
      icon: MapPin,
      color: "bg-green-500",
      component: GeoAttendanceMonitoring,
      features: [
        "GPS location tracking",
        "Face recognition verification",
        "Real-time punch in/out",
        "Office radius validation",
      ],
    },
    {
      id: "attendance-master",
      title: "Attendance Master",
      description: "Comprehensive attendance management",
      icon: Clock,
      color: "bg-orange-500",
      component: AttendanceMasterPage,
      features: [
        "Employee attendance tracking",
        "Period-based reporting",
        "Statistics and analytics",
        "Leave management",
      ],
    },
    {
      id: "salary-slip",
      title: "Generate Salary Slip",
      description: "Automated salary slip generation",
      icon: FileText,
      color: "bg-[#69231B]",
      component: GenerateSalarySlip,
      features: [
        "Queue-based processing",
        "PDF generation",
        "Bulk processing",
        "Attendance-based calculations",
      ],
    },
    {
      id: "leave-approval",
      title: "Leave Approval",
      description: "Review and approve employee leave requests",
      icon: Calendar,
      color: "bg-pink-500",
      component: LeaveApproval,
      features: [
        "Pending leave requests",
        "Approve/Reject leaves",
        "Leave balance tracking",
        "Leave history",
      ],
    },
    {
      id: "shift-management",
      title: "Shift Management",
      description: "Assign shifts, manage timings, and configure overtime",
      icon: Settings,
      color: "bg-[#69231B]",
      component: ShiftManagement,
      features: [
        "Assign employee shifts",
        "Configure shift timings",
        "Overtime rate management",
        "Break duration settings",
      ],
    },
  ];

  if (activeComponent) {
    const ActiveComponent = activeComponent;
    return (
      <div className="min-h-screen">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <button
            onClick={() => setActiveComponent(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to HRMS Dashboard
          </button>
        </div>
        <ActiveComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Human Resource Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete HRMS solution with face recognition, geo-attendance, and
            automated salary processing
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Backend Server Running</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Database Connected</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Face Recognition Ready</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">All APIs Active</span>
            </div>
          </div>
        </div>

        {/* HRMS Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hrmsModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 ${module.color} rounded-xl`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <button
                    onClick={() => setActiveComponent(module.component)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {module.title}
                </h3>
                <p className="text-gray-600 mb-6">{module.description}</p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {module.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            HRMS System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600">Core Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-gray-600">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-gray-600">Face Recognition</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
              <div className="text-gray-600">Scalability</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>
            HRMS System v1.0 - Built with React, Node.js, MongoDB, and Face
            Recognition
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRMSIndex;
